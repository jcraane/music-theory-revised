// The chords of a key as cards with degree names, optionally on a staff, above a piano.
// Shared by section 3 (major keys) and section 5 (major and relative minor).
// Clicking a card or a bar plays the chord. With `loop: true` a card is also added to a
// four-chord loop builder, which plays once it has four chords.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createLoopBuilder } from '../../ui/loop-builder.js';
import { createStaff } from '../../ui/staff.js';
import { roleLegend } from '../../ui/role-legend.js';
import { diatonicChords } from '../../theory/chords.js';
import { spellScale, degreeName } from '../../theory/scales.js';
import { voice, keyOctave, voiceKeyChords, play, showTriad, midis } from './shared.js';

export function createChordBoard(ctx, see, { legend = ['root', 'third', 'fifth'], loop: withLoop = false, staff: withStaff = false } = {}) {
  let chords = [];
  let voicings = [];
  let cards = [];

  const cardRow = h('div', { class: 'chord-row' });
  see.append(cardRow);
  const staff = withStaff ? createStaff(see, { onSelect: (i) => playOne(i + 1) }) : null;
  const piano = ctx.createPiano(see, { from: 48, octaves: 3 });
  see.append(roleLegend(legend));

  const step = (degree, beats, slot = null) => ({ notes: midis(voicings[degree - 1]), beats, degree, slot });
  const loopSteps = (degrees) => degrees.map((degree, slot) => step(degree, 2, slot));

  function show({ degree, slot }) {
    cards.forEach((card, i) => card.setActive(i === degree - 1));
    staff?.setActive(degree - 1);
    loop?.setActive(slot);
    piano.clear();
    showTriad(piano, voicings[degree - 1]);
    piano.setActive(voicings[degree - 1]);
  }

  function clearActive() {
    cards.forEach((card) => card.setActive(false));
    staff?.setActive(null);
    loop?.setActive(null);
    piano.setActive([]);
  }

  /** Plays steps made with step(), highlighting each chord's card, bar and keys as it sounds. */
  function playChords(steps, options) {
    const handle = play(ctx, steps, { ...options, onStep: show });
    handle.finished.then(clearActive);
    return handle;
  }

  const playOne = (degree) => playChords([step(degree, 2)], { bpm: 100 });

  const loop = withLoop
    ? createLoopBuilder({ play: (degrees) => playChords(loopSteps(degrees), { bpm: 100, loop: true }) })
    : null;

  function selectCard(chord) {
    if (!loop?.add(chord.degree)) playOne(chord.degree);
  }

  return {
    piano,
    loop,
    step,
    playChords,

    get chords() {
      return chords;
    },

    /** Shows the chords of a key. A playing loop keeps its degrees and moves to the new key. */
    setKey(tonic, mode) {
      chords = diatonicChords(tonic, mode);
      voicings = voiceKeyChords(tonic, mode, chords);
      cards = chords.map((chord) => createChordCard(chord, { onSelect: selectCard, detail: degreeName(chord.degree, mode) }));
      cardRow.replaceChildren(...cards.map((card) => card.element));
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
      showTriad(piano, voicings[0]);
    },

    /** Shows the key's scale from the tonic, with the tonic marked as home (root color). */
    showScale(tonic, mode) {
      const notes = voice(spellScale(tonic, mode), keyOctave(tonic));
      piano.clear();
      piano.highlight(notes, 'scale');
      piano.highlight([notes[0]], 'root');
    },
  };
}
