// Triads, chord qualities, Roman numerals and the diatonic chords of a key.

import { LETTERS, parseNote, noteName, pitchClass, semitonesBetween, mod12 } from './notes.js';
import { spellScale } from './scales.js';

// Semitones from the root to the third and to the fifth.
const QUALITY_INTERVALS = {
  major: [4, 7],
  minor: [3, 7],
  diminished: [3, 6],
  augmented: [4, 8],
};

const NAME_SUFFIX = { major: '', minor: 'm', diminished: 'dim', augmented: 'aug' };
const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Triad on a scale degree (1–7), built by stacking every other scale note. */
export function triad(scaleNotes, degree) {
  assertDegree(degree);
  const i = degree - 1;
  const notes = [0, 2, 4].map((step) => scaleNotes[(i + step) % scaleNotes.length]);
  return { root: notes[0], notes, quality: chordQuality(notes) };
}

/** Quality of a root-position triad from its intervals, or null if it is not one of the four. */
export function chordQuality(notes) {
  if (notes.length !== 3) return null;
  const third = semitonesBetween(notes[0], notes[1]);
  const fifth = semitonesBetween(notes[0], notes[2]);
  const match = Object.entries(QUALITY_INTERVALS).find(([, [t, f]]) => t === third && f === fifth);
  return match ? match[0] : null;
}

/** Roman numeral for a degree: uppercase major, lowercase minor, ° diminished, + augmented. */
export function romanNumeral(degree, quality) {
  assertDegree(degree);
  assertQuality(quality);
  const numeral = NUMERALS[degree - 1];
  switch (quality) {
    case 'major': return numeral;
    case 'minor': return numeral.toLowerCase();
    case 'diminished': return `${numeral.toLowerCase()}°`;
    case 'augmented': return `${numeral}+`;
  }
}

/** Chord symbol ("A", "minor" → "Am"; "B", "diminished" → "Bdim"). */
export function chordName(root, quality) {
  assertQuality(quality);
  return root + NAME_SUFFIX[quality];
}

/** The seven triads of a key, in scale order. */
export function diatonicChords(tonic, mode) {
  const scale = spellScale(tonic, mode);
  return scale.map((_, i) => {
    const degree = i + 1;
    const { root, notes, quality } = triad(scale, degree);
    return { degree, roman: romanNumeral(degree, quality), name: chordName(root, quality), notes, quality };
  });
}

/** Triad of any quality on any root, independent of a key ("F", "minor" → F Ab C). */
export function buildTriad(root, quality) {
  assertQuality(quality);
  const rootLetter = LETTERS.indexOf(parseNote(root).letter);
  const rootPitch = pitchClass(root);
  const [third, fifth] = QUALITY_INTERVALS[quality];

  return [0, third, fifth].map((semitones, i) => {
    const letter = LETTERS[(rootLetter + i * 2) % 7];
    const offset = mod12(rootPitch + semitones - pitchClass(letter));
    return noteName(letter, offset > 6 ? offset - 12 : offset);
  });
}

/** Notes that are not in the given scale, compared by spelling (Fb is outside C major). */
export function notesOutsideKey(notes, scaleNotes) {
  return notes.filter((note) => !scaleNotes.includes(note));
}

/** Notes two chords share, in the order of the first, compared by spelling (C and Am → C E). */
export function commonTones(a, b) {
  return a.filter((note) => b.includes(note));
}

function assertDegree(degree) {
  if (!Number.isInteger(degree) || degree < 1 || degree > 7) {
    throw new Error(`Degree must be 1–7, got ${degree}`);
  }
}

function assertQuality(quality) {
  if (!(quality in QUALITY_INTERVALS)) throw new Error(`Unknown chord quality: ${quality}`);
}
