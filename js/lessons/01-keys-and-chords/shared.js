// Helpers shared by lesson 01's sections.

import { toMidiAscending, semitonesBetween, intervalName, pitchClass } from '../../theory/notes.js';
import { spellScale } from '../../theory/scales.js';

export const ROLES = ['root', 'third', 'fifth'];

/** Spelled notes with the keys to play them on, rising from `octave`. */
export function voice(names, octave = 4) {
  return toMidiAscending(names, octave).map((midi, i) => ({ midi, name: names[i] }));
}

/**
 * The seven chords of a key as root-position voicings whose roots rise from the tonic.
 * The tonic sits in octave 4 up to F#, and in octave 3 from G, so every chord stays
 * between C3 and B5.
 */
export function voiceKeyChords(tonic, mode, chords) {
  const roots = voice(spellScale(tonic, mode), keyOctave(tonic));
  return chords.map((chord, i) => {
    const rootMidi = roots[i].midi;
    return chord.notes.map((name, j) => ({ name, midi: j === 0 ? rootMidi : rootMidi + semitonesBetween(chord.notes[0], name) }));
  });
}

/** Octave for a key's tonic: 4 up to F#, 3 from G, so chords stay between C3 and B5. */
export function keyOctave(tonic) {
  return pitchClass(tonic) <= 6 ? 4 : 3;
}

/** Stops whatever is playing, then plays the steps. */
export function play(ctx, steps, options) {
  ctx.audio.stopAll();
  return ctx.audio.playSequence(steps, options);
}

/** Shows a scale's notes (the tonic repeated on top) with the W and H steps between them. */
export function showScaleSteps(piano, notes, steps) {
  piano.clearAnnotations();
  piano.highlight(notes, 'scale');
  steps.forEach((step, i) => piano.annotate(notes[i].midi, notes[i + 1].midi, step));
}

/**
 * Plays a scale up and down at 100 BPM. Each note lights up as it plays, and the steps
 * appear on the way up. `onEnd` runs only if the scale plays to the end.
 */
export function playScale(ctx, piano, up, steps, { onEnd } = {}) {
  const down = up.slice(0, -1).reverse();
  piano.clear();
  piano.clearAnnotations();

  return play(ctx, [...up, ...down].map((note, i) => ({ notes: [note.midi], note, i })), {
    bpm: 100,
    onStep: ({ note, i }) => {
      piano.highlight([note], 'scale');
      piano.setActive([note]);
      if (i > 0 && i < up.length) piano.annotate(up[i - 1].midi, note.midi, steps[i - 1]);
    },
    onEnd: () => {
      piano.setActive([]);
      onEnd?.();
    },
  });
}

/** Colors a voiced triad [root, third, fifth] by role. */
export function showTriad(piano, notes) {
  notes.forEach((note, i) => piano.highlight([note], ROLES[i]));
}

/** "major 3rd" for two spelled notes a third apart. */
export function intervalBetween(a, b) {
  return intervalName(semitonesBetween(a.name, b.name));
}

export const midis = (notes) => notes.map((n) => n.midi);
