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
export function voiceKeyChords(tonic, chords) {
  const octave = pitchClass(tonic) <= 6 ? 4 : 3;
  const roots = voice(spellScale(tonic, 'major'), octave);
  return chords.map((chord, i) => {
    const rootMidi = roots[i].midi;
    return chord.notes.map((name, j) => ({ name, midi: j === 0 ? rootMidi : rootMidi + semitonesBetween(chord.notes[0], name) }));
  });
}

/** Stops whatever is playing, then plays the steps. */
export function play(ctx, steps, options) {
  ctx.audio.stopAll();
  return ctx.audio.playSequence(steps, options);
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
