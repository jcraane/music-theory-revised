// Section 3: why V pulls. The leading tone rises a half step to the tonic, and the tritone
// in vii° closes inward, shown as a two-voice view on the piano and the staff. V and vii°
// sit just below the tonic so the half steps are visible; any major key.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createPlayButton } from '../../ui/play-button.js';
import { createStaff } from '../../ui/staff.js';
import { roleLegend } from '../../ui/role-legend.js';
import { commonTonics } from '../../theory/scales.js';
import { diatonicChords } from '../../theory/chords.js';
import { toMidi } from '../../theory/notes.js';
import { keyOctave, voiceOn, play, showTriad, midis } from '../common/shared.js';

const READ = [
  'V pulls home because of one note. Its third, B in C major, is the leading tone: a half ' +
    'step below the tonic, close enough that it wants to slide up into it. vii° has the same ' +
    'B, plus an F that leans down towards E. B and F are 6 semitones apart: the tritone, the ' +
    'most unstable interval in the key. When vii° moves to I, the tritone closes inward. B ' +
    'goes up to C, F goes down to E, and the tension is gone.',
];

const BPM = 80;

export default {
  id: 'why-v-pulls',
  title: 'Why V pulls',
  render(container, ctx) {
    let key = null;
    let cards = [];
    let withoutLeadingTone = false;

    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => playSteps([
        ...pair(key.V, key.I),
        ...pair([key.leading], [key.tonic]),
        ...pair(key.vii, key.I),
      ]),
      caption: '',
      read: READ,
    });

    const cardRow = h('div', { class: 'chord-row chord-row--three' });
    see.append(cardRow);
    const piano = ctx.createPiano(see, { from: 48, octaves: 3 });
    see.append(roleLegend(['root', 'third', 'fifth', 'scale']));
    const staff = createStaff(see);

    // V and vii° just below the tonic, I from the tonic up; the tritone is vii°'s root and fifth.
    function keyFor(tonic) {
      const chords = diatonicChords(tonic, 'major');
      const tonicMidi = toMidi(tonic, keyOctave(tonic));
      const I = voiceOn(chords[0].notes, tonicMidi);
      const V = voiceOn(chords[4].notes, tonicMidi - 5);
      const vii = voiceOn(chords[6].notes, tonicMidi - 1);
      return {
        name: tonic,
        chords: [chords[4], chords[6], chords[0]],
        voicings: [V, vii, I],
        I, V, vii,
        tonic: I[0],
        third: I[1],
        leading: vii[0],
        fourth: vii[2],
      };
    }

    const pair = (from, to) => [{ notes: from, beats: 2 }, { notes: to, beats: 2 }];

    // Chords show in root, third and fifth colors as they sound (V without its third as root
    // and fifth); single notes as scale notes.
    function show({ notes }) {
      piano.clear();
      if (notes.length === 3) showTriad(piano, notes);
      else if (notes.length === 2) notes.forEach((note, i) => piano.highlight([note], i === 0 ? 'root' : 'fifth'));
      else piano.highlight(notes, 'scale');
      piano.setActive(notes);
      const index = key.voicings.findIndex((voicing) => voicing.length === notes.length && voicing.every((n, i) => n.midi === notes[i].midi));
      cards.forEach((card, i) => card.setActive(i === index));
    }

    // At rest: the two voices of the resolution, with brackets for the half steps.
    function showResolution() {
      piano.clear();
      piano.setActive([]);
      piano.highlight([key.leading, key.fourth, key.tonic, key.third], 'scale');
      cards.forEach((card) => card.setActive(false));
    }

    function playSteps(steps) {
      return play(ctx, steps.map((step) => ({ ...step, notes: midis(step.notes), voiced: step.notes })), {
        bpm: BPM,
        onStep: ({ voiced }) => show({ notes: voiced }),
        onEnd: showResolution,
      });
    }

    function setKey(tonic) {
      key = keyFor(tonic);
      const leading = prettyName(key.leading.name);
      cards = key.chords.map((chord, i) => createChordCard(chord, {
        onSelect: () => playSteps([{ notes: key.voicings[i], beats: 2 }]),
        extra: chord.degree === 1 ? null : `Leading tone: ${leading}`,
      }));
      cardRow.replaceChildren(...cards.map((card) => card.element));

      piano.clearAnnotations();
      piano.annotate(key.leading.midi, key.tonic.midi, 'half step up');
      piano.annotate(key.fourth.midi, key.third.midi, 'half step down', { lane: 'below' });
      showResolution();

      const plain = (note) => ({ ...note, role: 'plain' });
      const dyad = (a, b) => `${prettyName(a.name)}–${prettyName(b.name)}`;
      staff.render({
        chords: [
          { notes: [key.leading, key.fourth].map(plain), label: dyad(key.leading, key.fourth) },
          { notes: [key.tonic, key.third].map(plain), label: dyad(key.tonic, key.third) },
        ],
        keyLabel: `${prettyName(tonic)}:`,
        label: `The tritone ${dyad(key.leading, key.fourth)} resolving to ${dyad(key.tonic, key.third)}`,
      });

      const [V, vii, I] = key.chords.map((chord) => prettyName(chord.name));
      caption.textContent = `${V}–${I}, then ${leading}–${prettyName(tonic)}, then ${vii}–${I}.`;
      info.textContent = `Leading tone: ${leading}, a half step below ${prettyName(tonic)}. ` +
        `Tritone in vii°: ${dyad(key.leading, key.fourth)}.`;
    }

    const info = h('p', {});
    const buttons = [
      { label: 'Play V, then I', steps: () => pair(withoutLeadingTone ? [key.V[0], key.V[2]] : key.V, key.I) },
      { label: 'Play vii°, then I', steps: () => pair(key.vii, key.I) },
      { label: 'Play the leading tone', steps: () => pair([key.leading], [key.tonic]) },
    ].map(({ label, steps }) => createPlayButton({ label, primary: false, play: () => playSteps(steps()) }).element);

    const toggle = h('button', {
      type: 'button',
      class: 'button',
      'aria-pressed': 'false',
      onclick: () => {
        withoutLeadingTone = !withoutLeadingTone;
        toggle.setAttribute('aria-pressed', String(withoutLeadingTone));
        toggleNote.hidden = !withoutLeadingTone;
      },
    }, 'Leave out the leading tone');
    const toggleNote = h('p', { class: 'swap__explanation', hidden: true },
      'Now V plays only its root and fifth. Play V, then I again: without the leading tone the pull is much weaker.');

    tryIt.append(
      h('p', {}, 'Pick a major key. The leading tone and the tritone change with it.'),
      createKeySelector({ tonics: commonTonics('major'), value: 'C', onChange: setKey }).element,
      info,
      h('div', { class: 'button-row' }, buttons),
      h('h3', { class: 'lesson-part__subtitle' }, 'Without the leading tone'),
      h('div', { class: 'swap' }, toggle, toggleNote),
    );

    setKey('C');
  },
};
