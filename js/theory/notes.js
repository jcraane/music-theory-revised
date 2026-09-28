// Note names, pitch classes and MIDI numbers.
// A note name is a letter A–G followed by up to two sharps (#) or flats (b), e.g. "C", "F#", "Bb", "F##".

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const INTERVAL_NAMES = [
  'unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'tritone',
  'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th', 'octave',
];

const NOTE_PATTERN = /^([A-G])(#{1,2}|b{1,2})?$/;

/** Splits a note name into its letter and accidental offset in semitones ("Bb" → { letter: "B", offset: -1 }). */
export function parseNote(name) {
  const match = typeof name === 'string' ? NOTE_PATTERN.exec(name) : null;
  if (!match) throw new Error(`Invalid note name: ${name}`);
  const accidental = match[2] ?? '';
  const offset = accidental.startsWith('#') ? accidental.length : -accidental.length;
  return { letter: match[1], offset };
}

/** Builds a note name from a letter and an accidental offset of -2 to +2. */
export function noteName(letter, offset) {
  if (!(letter in NATURAL_PITCH)) throw new Error(`Invalid letter: ${letter}`);
  if (!Number.isInteger(offset) || Math.abs(offset) > 2) {
    throw new Error(`Cannot spell ${letter} with an offset of ${offset}`);
  }
  return letter + (offset > 0 ? '#'.repeat(offset) : 'b'.repeat(-offset));
}

/** Pitch class 0–11 of a note name ("C#" → 1, "Db" → 1, "Cb" → 11). */
export function pitchClass(name) {
  const { letter, offset } = parseNote(name);
  return mod12(NATURAL_PITCH[letter] + offset);
}

/** Semitones going up from note a to note b, 0–11 ("C", "E" → 4). */
export function semitonesBetween(a, b) {
  return mod12(pitchClass(b) - pitchClass(a));
}

/**
 * MIDI number of a note in an octave, with C4 = 60.
 * The octave belongs to the letter, so B#3 is 60 and Cb4 is 59.
 */
export function toMidi(name, octave) {
  if (!Number.isInteger(octave)) throw new Error(`Invalid octave: ${octave}`);
  const { letter, offset } = parseNote(name);
  return (octave + 1) * 12 + NATURAL_PITCH[letter] + offset;
}

/**
 * MIDI numbers for notes played bottom to top: the first note in `octave`, and each
 * following note the nearest one above the previous (["A", "C", "E"], 4 → 69, 72, 76).
 */
export function toMidiAscending(names, octave) {
  const midis = [];
  for (const name of names) {
    let midi = toMidi(name, octave);
    const previous = midis.at(-1);
    if (previous !== undefined) {
      while (midi <= previous) midi += 12;
      while (midi - 12 > previous) midi -= 12;
    }
    midis.push(midi);
  }
  return midis;
}

/** Plain name of an interval of 0–12 semitones (4 → "major 3rd"). */
export function intervalName(semitones) {
  if (!Number.isInteger(semitones) || semitones < 0 || semitones > 12) {
    throw new Error(`Interval must be 0–12 semitones, got ${semitones}`);
  }
  return INTERVAL_NAMES[semitones];
}

export function mod12(n) {
  return ((n % 12) + 12) % 12;
}
