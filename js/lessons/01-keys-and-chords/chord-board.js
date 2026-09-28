// The chords of a key as cards above a piano, with a four-chord loop builder.
// Shared by section 3 (major keys) and section 5 (major and relative minor).
// Clicking a card plays it and adds it to the loop; the loop plays once it has four chords.

import { h } from '../../ui/dom.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createLoopBuilder } from '../../ui/loop-builder.js';
import { roleLegend } from '../../ui/role-legend.js';
import { diatonicChords } from '../../theory/chords.js';
import { spellScale } from '../../theory/scales.js';
import { voice, keyOctave, voiceKeyChords, play, showTriad, midis } from './shared.js';

export function createChordBoard(ctx, see, { legend = ['root', 'third', 'fifth'] } = {}) {
  let chords = [];
  let voicings = [];
  let cards = [];

  const cardRow = h('div', { class: 'chord-row' });
  see.append(cardRow);
  const piano = ctx.createPiano(see, { from: 48, octaves: 3 });
  see.append(roleLegend(legend));

  const step = (degree, beats, slot = null) => ({ notes: midis(voicings[degree - 1]), beats, degree, slot });
  const loopSteps = (degrees) => degrees.map((degree, slot) => step(degree, 2, slot));

  function show({ degree, slot }) {
    cards.forEach((card, i) => card.setActive(i === degree - 1));
    loop.setActive(slot);
    piano.clear();
    showTriad(piano, voicings[degree - 1]);
    piano.setActive(voicings[degree - 1]);
  }

  function clearActive() {
    cards.forEach((card) => card.setActive(false));
    loop.setActive(null);
    piano.setActive([]);
  }

  /** Plays steps made with step(), highlighting each chord's card and keys as it sounds. */
  function playChords(steps, options) {
    const handle = play(ctx, steps, { ...options, onStep: show });
    handle.finished.then(clearActive);
    return handle;
  }

  const loop = createLoopBuilder({
    play: (degrees) => playChords(loopSteps(degrees), { bpm: 100, loop: true }),
  });

  function selectCard(chord) {
    if (!loop.add(chord.degree)) playChords([step(chord.degree, 2)], { bpm: 100 });
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
      cards = chords.map((chord) => createChordCard(chord, { onSelect: selectCard }));
      cardRow.replaceChildren(...cards.map((card) => card.element));
      loop.setChords(chords);
      loop.handle?.setSteps(loopSteps(loop.degrees));
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
