// Major and natural minor scales, spelled so each letter appears once.

import { LETTERS, parseNote, noteName, pitchClass, mod12 } from './notes.js';

const STEPS = {
  major: ['W', 'W', 'H', 'W', 'W', 'W', 'H'],
  minor: ['W', 'H', 'W', 'W', 'H', 'W', 'W'],
};

/** Whole (W) and half (H) step pattern of a mode: "major" or "minor" (natural minor). */
export function scaleSteps(mode) {
  if (!(mode in STEPS)) throw new Error(`Unknown mode: ${mode}`);
  return [...STEPS[mode]];
}

/** The seven notes of a scale, one per letter ("F", "major" → F G A Bb C D E). */
export function spellScale(tonic, mode) {
  const steps = scaleSteps(mode);
  const startLetter = LETTERS.indexOf(parseNote(tonic).letter);
  let pitch = pitchClass(tonic);

  return steps.map((step, i) => {
    const letter = LETTERS[(startLetter + i) % 7];
    const name = noteName(letter, accidentalFor(letter, pitch));
    pitch += step === 'W' ? 2 : 1;
    return name;
  });
}

/** Tonic of the minor key with the same notes, on the 6th degree (C → A, F# → D#). */
export function relativeMinor(tonic) {
  return spellScale(tonic, 'major')[5];
}

/** Tonic of the major key with the same notes, on the 3rd degree of the minor scale (A → C). */
export function relativeMajor(tonic) {
  return spellScale(tonic, 'minor')[2];
}

/**
 * One tonic per pitch class, in pitch order, spelled so its scale has the fewest sharps
 * and flats. A tie (F# or Gb major, D# or Eb minor) goes to the sharp spelling.
 */
export function commonTonics(mode) {
  const accidentals = (tonic) => spellScale(tonic, mode).reduce((sum, n) => sum + Math.abs(parseNote(n).offset), 0);
  const candidates = LETTERS.flatMap((letter) => [-1, 0, 1].map((offset) => noteName(letter, offset)));

  return Array.from({ length: 12 }, (_, pc) =>
    candidates
      .filter((name) => pitchClass(name) === pc)
      .map((name) => ({ name, count: accidentals(name), flat: parseNote(name).offset < 0 }))
      .sort((a, b) => a.count - b.count || a.flat - b.flat)[0].name,
  );
}

// Offset that turns a natural letter into the target pitch class, in the range -6..+5.
function accidentalFor(letter, targetPitch) {
  const offset = mod12(targetPitch - pitchClass(letter));
  return offset > 6 ? offset - 12 : offset;
}
