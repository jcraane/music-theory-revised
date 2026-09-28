// Section 4: why the qualities differ. Semitones counted on the piano, triads drawn as
// two stacked thirds, and a side-by-side comparison with a raise/lower-the-third toggle.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createPlayButton } from '../../ui/play-button.js';
import { roleLegend } from '../../ui/role-legend.js';
import { semitonesBetween, intervalName } from '../../theory/notes.js';
import { diatonicChords, buildTriad, chordName } from '../../theory/chords.js';
import { voice, play, showTriad, intervalBetween, midis } from './shared.js';

const READ = [
  'The difference between major and minor is one semitone in the middle note. A major third ' +
    'is 4 semitones, a minor third is 3. Because the scale\'s steps are uneven (those two half ' +
    'steps), stacking thirds within it sometimes lands on a major third and sometimes on a ' +
    'minor one. The chord on vii° gets two minor thirds, which squeezes its outer notes to 6 ' +
    'semitones instead of 7. That narrowed fifth is what makes it sound tense.',
];

const C_MAJOR = diatonicChords('C', 'major');
const FLIP = { major: 'minor', minor: 'major' };

export default {
  id: 'why-qualities-differ',
  title: 'Why the qualities differ',
  render(container, ctx) {
    const { see, tryIt } = sectionLayout(container, {
      listen: () => listen(),
      caption: 'C to E, then D to F. Then the C major and D minor chords.',
      read: READ,
    });

    const piano = ctx.createPiano(see);
    see.append(roleLegend(['root', 'third', 'fifth']), stackedThirds());

    const [c, e, g] = voice(['C', 'E', 'G']);
    const [d, f, a] = voice(['D', 'F', 'A']);

    // Two notes a third apart, with every semitone between them numbered.
    function showInterval(low, high) {
      piano.clear();
      piano.clearAnnotations();
      piano.highlight([low], 'root');
      piano.highlight([high], 'third');
      for (let midi = low.midi; midi < high.midi; midi++) {
        piano.annotate(midi, midi + 1, String(midi - low.midi + 1), { lane: 'below' });
      }
      piano.annotate(low.midi, high.midi, intervalBetween(low, high));
    }

    function showChord(notes) {
      piano.clear();
      piano.clearAnnotations();
      showTriad(piano, notes);
      piano.annotate(notes[0].midi, notes[1].midi, intervalBetween(notes[0], notes[1]));
      piano.annotate(notes[1].midi, notes[2].midi, intervalBetween(notes[1], notes[2]));
    }

    function listen() {
      const steps = [
        { notes: midis([c, e]), beats: 2, sounding: [c, e], show: () => showInterval(c, e) },
        { notes: midis([d, f]), beats: 2, sounding: [d, f], show: () => showInterval(d, f) },
        { notes: midis([c, e, g]), beats: 2, sounding: [c, e, g], show: () => showChord([c, e, g]) },
        { notes: midis([d, f, a]), beats: 2, sounding: [d, f, a], show: () => showChord([d, f, a]) },
      ];
      const handle = play(ctx, steps, {
        bpm: 80,
        onStep: (step) => {
          step.show();
          piano.setActive(step.sounding);
        },
      });
      handle.finished.then(() => piano.setActive([]));
      return handle;
    }

    showInterval(c, e);

    tryIt.append(
      h('p', {}, 'Pick two chords from C major and compare their thirds. Then flip the third of a chord to hear major turn into minor and back.'),
      h('div', { class: 'compare' }, comparePanel(ctx, 'First chord', 0), comparePanel(ctx, 'Second chord', 1)),
    );
  },
};

/** One side of the comparison: pick a chord, see its thirds counted, flip its third. */
function comparePanel(ctx, label, initialIndex) {
  let base = C_MAJOR[initialIndex];
  let flipped = false;

  const current = () => {
    if (!flipped) return { name: base.name, quality: base.quality, notes: base.notes };
    const quality = FLIP[base.quality];
    return { name: chordName(base.notes[0], quality), quality, notes: buildTriad(base.notes[0], quality) };
  };

  const heading = h('p', { class: 'compare__chord' });
  const facts = h('ul', { class: 'compare__facts' });
  const pianoBox = h('div');
  const piano = ctx.createPiano(pianoBox);

  const select = h('select', {
    onchange: (e) => {
      base = C_MAJOR[Number(e.target.value)];
      flipped = false;
      update();
      playCurrent();
    },
  }, C_MAJOR.map((chord, i) => h('option', { value: String(i), selected: i === initialIndex }, `${chord.roman} · ${prettyName(chord.name)}`)));

  const toggle = h('button', {
    type: 'button',
    class: 'button',
    'aria-pressed': 'false',
    onclick: () => {
      flipped = !flipped;
      update();
      playCurrent();
    },
  });
  const toggleNote = h('p', { class: 'hint' }, 'Two minor thirds already: flip the third of a major or minor chord instead.');

  const playButton = createPlayButton({ label: 'Play', primary: false, play: () => playCurrent() });

  function playCurrent() {
    const notes = voice(current().notes);
    const handle = play(ctx, [{ notes: midis(notes), beats: 3 }], {
      bpm: 90,
      onStep: () => piano.setActive(notes),
    });
    handle.finished.then(() => piano.setActive([]));
    return handle;
  }

  function update() {
    const chord = current();
    const notes = voice(chord.notes);
    const [root, third, fifth] = notes;
    const lower = semitonesBetween(root.name, third.name);
    const upper = semitonesBetween(third.name, fifth.name);
    const outer = semitonesBetween(root.name, fifth.name);

    heading.textContent = `${prettyName(chord.name)}: ${chord.quality}${flipped ? ' (third flipped)' : ''}`;
    piano.clear();
    piano.clearAnnotations();
    showTriad(piano, notes);
    piano.annotate(root.midi, third.midi, String(lower));
    piano.annotate(third.midi, fifth.midi, String(upper));
    piano.annotate(root.midi, fifth.midi, String(outer), { lane: 'below' });

    facts.replaceChildren(
      h('li', {}, `Root to third: ${lower} semitones, a ${intervalName(lower)}`),
      h('li', {}, `Third to fifth: ${upper} semitones, a ${intervalName(upper)}`),
      h('li', {}, `Root to fifth: ${outer} semitones, ${outer === 6 ? 'a narrowed fifth' : `a ${intervalName(outer)}`}`),
    );

    const canFlip = base.quality in FLIP;
    toggle.hidden = !canFlip;
    toggleNote.hidden = canFlip;
    toggle.setAttribute('aria-pressed', String(flipped));
    if (canFlip) {
      const lowering = (base.quality === 'major') !== flipped;
      toggle.textContent = lowering ? 'Lower the third' : 'Raise the third';
    }
  }

  update();

  return h('div', { class: 'compare__panel' },
    h('label', { class: 'field' }, h('span', { class: 'field__label' }, label), select),
    heading,
    pianoBox,
    facts,
    h('div', { class: 'button-row' }, playButton.element, toggle),
    toggleNote,
  );
}

// Each triad as two stacked thirds, drawn to scale: a major third is 4 units tall, a minor third 3.
function stackedThirds() {
  const kinds = [
    { name: 'Major', thirds: [4, 3] },
    { name: 'Minor', thirds: [3, 4] },
    { name: 'Diminished', thirds: [3, 3] },
  ];
  return h('div', { class: 'stacks', role: 'list', 'aria-label': 'Triads as stacked thirds' },
    kinds.map(({ name, thirds: [lower, upper] }) =>
      h('div', { class: 'stack', role: 'listitem', 'aria-label': `${name}: ${intervalName(lower)} plus ${intervalName(upper)}, ${lower + upper} semitones` },
        h('div', { class: 'stack__blocks', 'aria-hidden': 'true' },
          [upper, lower].map((semitones) =>
            h('span', { class: `stack__third stack__third--${semitones === 4 ? 'major' : 'minor'}`, style: `height: ${semitones * 1.5}rem` },
              intervalName(semitones)))),
        h('p', { class: 'stack__name' }, name),
        h('p', { class: 'stack__total' }, `${lower} + ${upper} = ${lower + upper}`)),
    ),
  );
}
