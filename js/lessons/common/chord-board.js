// The chords of a key as cards, optionally on a staff, above a piano. Used by lesson 01
// sections 3 and 5 and by lesson 02. Clicking a card or a bar plays the chord. With
// `loop: true` a card is also added to a four-chord loop builder, which plays once it has
// four chords. `colorBy` picks the card treatment: "quality" (major, minor, diminished,
// with degree names) or "function" (tonic, subdominant, dominant, with the function named).
//
// Other options:
// - groupBy: "function" shows the cards in three labeled families instead of one row.
// - extra(chord): an extra line for a card, or null.
// - onSelect(chord): replaces what clicking a card or bar does (play it, or add it to the loop).
// - onStep(step): runs whenever a chord is shown as it sounds, and with null when playing ends.
// - onLoopChange(degrees): runs when the loop gains a chord or is cleared.

import { h } from '../../ui/dom.js';
import { prettyName, functionLabel } from '../../ui/format.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createLoopBuilder } from '../../ui/loop-builder.js';
import { createStaff } from '../../ui/staff.js';
import { roleLegend } from '../../ui/role-legend.js';
import { diatonicChords } from '../../theory/chords.js';
import { functionOf } from '../../theory/harmony.js';
import { spellScale, scaleSteps, degreeName } from '../../theory/scales.js';
import { voice, keyOctave, voiceKeyChords, play, playScale, showScaleSteps, showTriad, midis } from './shared.js';

// The families in the order the lessons name them: the main chord first, then its stand-ins.
const FAMILY_GROUPS = [
  { family: 'tonic', label: 'Tonic: home', degrees: [1, 6, 3] },
  { family: 'subdominant', label: 'Subdominant: away', degrees: [4, 2] },
  { family: 'dominant', label: 'Dominant: tension', degrees: [5, 7] },
];

export function createChordBoard(ctx, see, {
  legend = ['root', 'third', 'fifth'],
  loop: withLoop = false,
  staff: withStaff = false,
  colorBy = 'quality',
  groupBy = null,
  extra = () => null,
  onSelect = null,
  onStep = null,
  onLoopChange = null,
} = {}) {
  if (colorBy !== 'quality' && colorBy !== 'function') throw new Error(`Unknown colorBy: ${colorBy}`);
  if (groupBy !== null && groupBy !== 'function') throw new Error(`Unknown groupBy: ${groupBy}`);

  let chords = [];
  let voicings = [];
  let cards = [];

  const cardsElement = h('div', { class: groupBy ? 'chord-families' : 'chord-row' });
  see.append(cardsElement);
  const staff = withStaff ? createStaff(see, { onSelect: (i) => selectCard(chords[i]) }) : null;
  const piano = ctx.createPiano(see, { from: 48, octaves: 3 });
  see.append(roleLegend(legend));

  const step = (degree, beats, slot = null) => ({ notes: midis(voicings[degree - 1]), beats, degree, slot });
  const loopSteps = (degrees) => degrees.map((degree, slot) => step(degree, 2, slot));

  // A step without a degree is a rest: nothing is highlighted while it lasts.
  function show(current) {
    const { degree, slot = null } = current;
    if (!degree) {
      clearActive();
      return;
    }
    cards.forEach((card, i) => card.setActive(i === degree - 1));
    staff?.setActive(degree - 1);
    loop?.setActive(slot);
    piano.clear();
    piano.clearAnnotations();
    showTriad(piano, voicings[degree - 1]);
    piano.setActive(voicings[degree - 1]);
    onStep?.(current);
  }

  function clearActive() {
    cards.forEach((card) => card.setActive(false));
    staff?.setActive(null);
    loop?.setActive(null);
    piano.setActive([]);
    onStep?.(null);
  }

  /** Plays steps made with step(), highlighting each chord's card, bar and keys as it sounds. */
  function playChords(steps, options) {
    const handle = play(ctx, steps, { ...options, onStep: show });
    handle.finished.then(clearActive);
    return handle;
  }

  const playOne = (degree) => playChords([step(degree, 2)], { bpm: 100 });

  // A key's scale from the tonic up to the tonic an octave higher.
  const scaleNotes = (tonic, mode) => {
    const names = spellScale(tonic, mode);
    return voice([...names, names[0]], keyOctave(tonic));
  };

  const markTonics = (notes) => piano.highlight([notes[0], notes.at(-1)], 'root');

  const loop = withLoop
    ? createLoopBuilder({ play: (degrees) => playChords(loopSteps(degrees), { bpm: 100, loop: true }), onChange: onLoopChange })
    : null;

  function selectCard(chord) {
    if (onSelect) onSelect(chord);
    else if (!loop?.add(chord.degree)) playOne(chord.degree);
  }

  function renderCards() {
    const detail = (chord) => (chord.fn ? functionLabel(chord.fn) : degreeName(chord.degree, chord.mode));
    cards = chords.map((chord) => createChordCard(chord, { onSelect: selectCard, detail: detail(chord), extra: extra(chord) }));
    if (!groupBy) {
      cardsElement.replaceChildren(...cards.map((card) => card.element));
      return;
    }
    cardsElement.replaceChildren(...FAMILY_GROUPS.map(({ family, label, degrees }) =>
      h('section', { class: 'chord-family', 'data-function': family, 'aria-label': label },
        h('h3', { class: 'chord-family__label' }, label),
        h('div', { class: 'chord-row' }, degrees.map((degree) => cards[degree - 1].element)))));
  }

  return {
    piano,
    loop,
    step,
    playChords,
    /** The cards (a row, or the families), so a section can place them elsewhere. */
    cardsElement,

    get chords() {
      return chords;
    },

    /** The voiced notes of the chord on a degree: [{ midi, name }], root first. */
    voicing(degree) {
      return voicings[degree - 1];
    },

    /** Plays the chord on a degree, as clicking its card does without a loop. */
    playChord(degree) {
      return playOne(degree);
    },

    /** Shows the chords of a key. A playing loop keeps its degrees and moves to the new key. */
    setKey(tonic, mode) {
      chords = diatonicChords(tonic, mode).map((chord) => ({
        ...chord,
        mode,
        ...(colorBy === 'function' ? { fn: functionOf(chord.degree, mode) } : {}),
      }));
      voicings = voiceKeyChords(tonic, mode, chords);
      renderCards();
      // Key label as in analysis: "C:" for major, "a:" for minor.
      const key = prettyName(tonic);
      staff?.render({
        chords: voicings.map((notes, i) => ({ notes, label: chords[i].roman })),
        keyLabel: `${mode === 'major' ? key : key[0].toLowerCase() + key.slice(1)}:`,
        label: `The seven chords of ${key} ${mode} on a treble staff`,
      });
      loop?.setChords(chords);
      loop?.handle?.setSteps(loopSteps(loop.degrees));
      piano.clear();
      piano.clearAnnotations();
      showTriad(piano, voicings[0]);
    },

    /** Shows the key's scale with its W and H steps, and the tonic marked as home (root color). */
    showScale(tonic, mode) {
      const notes = scaleNotes(tonic, mode);
      piano.clear();
      showScaleSteps(piano, notes, scaleSteps(mode));
      markTonics(notes);
    },

    /** Plays the key's scale up and down, then shows it as showScale() does. */
    playScale(tonic, mode) {
      const notes = scaleNotes(tonic, mode);
      return playScale(ctx, piano, notes, scaleSteps(mode), { onEnd: () => markTonics(notes) });
    },
  };
}
