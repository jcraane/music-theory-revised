// Section 6: experiment. Swap a chord in C–Am–F–G for one from outside the key and hear
// the color change; the outside note lights up. Swaps can be toggled while the loop plays.

import { h } from '../../ui/dom.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createChordCard } from '../../ui/chord-card.js';
import { roleLegend } from '../../ui/role-legend.js';
import { spellScale } from '../../theory/scales.js';
import { diatonicChords, buildTriad, chordName, romanNumeral, notesOutsideKey } from '../../theory/chords.js';
import { voice, play, midis } from './shared.js';

const READ = ['Every chord so far came from the key. What happens if we use one that doesn\'t?'];

const C_MAJOR_SCALE = spellScale('C', 'major');
const C_MAJOR = diatonicChords('C', 'major');

// A chord outside C major on the same degree as the chord it replaces.
function outsideChord(degree, quality) {
  const root = C_MAJOR[degree - 1].notes[0];
  return { degree, roman: romanNumeral(degree, quality), name: chordName(root, quality), notes: buildTriad(root, quality), quality, outside: true };
}

const SWAPS = [
  {
    id: 'fm',
    label: 'Swap F for Fm',
    slot: 2,
    chord: outsideChord(4, 'minor'),
    explanation:
      "That A♭ isn't in C major. The chord sounds bittersweet, as if the song briefly turned " +
      "sad. It's borrowed from C minor, one of the most-used color moves in pop and film music.",
  },
  {
    id: 'a-major',
    label: 'Swap Am for A major',
    slot: 1,
    chord: outsideChord(6, 'major'),
    explanation:
      'The C♯ wants to rise to D, so this chord pulls you forward towards Dm. Outside-key ' +
      "chords aren't wrong, they create color and direction. Later lessons are all about using them on purpose.",
  },
];

export default {
  id: 'sticking-out',
  title: 'Experiment: sticking out',
  render(container, ctx) {
    const swapped = new Set();
    let cards = [];
    let handle = null;

    const { see, tryIt } = sectionLayout(container, {
      listen: () => playLoop(),
      caption: 'C, Am, F, G in C major, on repeat.',
      read: READ,
    });

    const cardRow = h('div', { class: 'chord-row chord-row--four' });
    see.append(cardRow);
    const piano = ctx.createPiano(see);
    see.append(roleLegend(['scale', 'outside-key']));

    const chords = () => {
      const loop = [1, 6, 4, 5].map((degree) => C_MAJOR[degree - 1]);
      for (const swap of SWAPS) if (swapped.has(swap.id)) loop[swap.slot] = swap.chord;
      return loop;
    };

    const steps = () => chords().map((chord, slot) => ({ notes: midis(voice(chord.notes)), beats: 2, chord, slot }));

    // `sounding` marks the keys as playing; off when only showing a chord after a swap.
    function show({ chord, slot }, { sounding = true } = {}) {
      const notes = voice(chord.notes);
      const outside = new Set(notesOutsideKey(chord.notes, C_MAJOR_SCALE));
      cards.forEach((card, i) => card.setActive(i === slot));
      piano.clear();
      piano.highlight(notes, 'scale');
      piano.highlight(notes.filter((n) => outside.has(n.name)), 'outside-key');
      piano.setActive(sounding ? notes : []);
    }

    function clearActive() {
      cards.forEach((card) => card.setActive(false));
      piano.setActive([]);
    }

    function playLoop() {
      const current = play(ctx, steps(), { bpm: 100, loop: true, onStep: show });
      handle = current;
      current.finished.then(() => {
        clearActive();
        if (handle === current) handle = null;
      });
      return current;
    }

    function playOne(chord, slot) {
      const once = play(ctx, [{ notes: midis(voice(chord.notes)), beats: 2, chord, slot }], { bpm: 100, onStep: show });
      once.finished.then(clearActive);
    }

    function renderCards() {
      cards = chords().map((chord, slot) => createChordCard(chord, { onSelect: () => playOne(chord, slot) }));
      cardRow.replaceChildren(...cards.map((card) => card.element));
    }

    const explanations = new Map();
    const toggles = SWAPS.map((swap) => {
      const explanation = h('p', { class: 'swap__explanation', hidden: true }, swap.explanation);
      explanations.set(swap.id, explanation);
      const button = h('button', {
        type: 'button',
        class: 'button',
        'aria-pressed': 'false',
        onclick: () => {
          const on = !swapped.has(swap.id);
          if (on) swapped.add(swap.id);
          else swapped.delete(swap.id);
          button.setAttribute('aria-pressed', String(on));
          explanation.hidden = !on;
          renderCards();
          // A playing loop picks up the change from its next chord.
          if (handle) handle.setSteps(steps());
          else show({ chord: on ? swap.chord : chords()[swap.slot], slot: swap.slot }, { sounding: false });
        },
      }, swap.label);
      return h('div', { class: 'swap' }, button, explanation);
    });

    tryIt.append(
      h('p', {}, 'Start the loop, then switch a swap on and off while it plays. Purple keys are notes from outside C major.'),
      ...toggles,
    );

    renderCards();
    show({ chord: C_MAJOR[0], slot: -1 }, { sounding: false });
  },
};
