// Quiz questions for lesson 01, generated from the theory engine so every attempt differs.
// Pure: pass a random function (0 ≤ x < 1) to get a reproducible quiz.
//
// A question is { kind, prompt, options, answer, explanation, sound, meta }:
// options are display strings, answer is the index of the right one, and sound is a list
// of chords (spelled note names) to play for the question or the explanation.

import { spellScale, relativeMinor, commonTonics } from '../../theory/scales.js';
import { diatonicChords, buildTriad } from '../../theory/chords.js';
import { semitonesBetween, intervalName } from '../../theory/notes.js';
import { prettyName } from '../../ui/format.js';

const QUALITIES = ['major', 'minor', 'diminished'];
const QUALITY_OPTIONS = ['Major', 'Minor', 'Diminished'];
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];
const FLIP_THIRD = { major: 'minor', minor: 'major', diminished: 'minor' };

export function createQuestions(random = Math.random) {
  const pick = (list) => list[Math.floor(random() * list.length)];
  const degree = () => 1 + Math.floor(random() * 7);
  const tonics = commonTonics('major');

  // Every quality at least once in the four ear questions.
  const earQualities = shuffle([...QUALITIES, pick(QUALITIES)], random);
  const ear = earQualities.map((quality) => earQuestion(pick(tonics), quality));

  const theory = [
    whichChord(pick(tonics), degree(), random),
    chordNotes(pick(tonics), degree(), random),
    qualityOfDegree(degree()),
    relativeMinorOf(pick(tonics), random),
  ];

  return shuffle([...ear, ...theory], random);
}

function earQuestion(root, quality) {
  const notes = buildTriad(root, quality);
  const lower = intervalName(semitonesBetween(notes[0], notes[1]));
  const upper = intervalName(semitonesBetween(notes[1], notes[2]));
  return {
    kind: 'ear',
    prompt: 'Listen. Is this chord major, minor or diminished?',
    options: QUALITY_OPTIONS,
    answer: QUALITIES.indexOf(quality),
    explanation: `It was ${prettyName(root)} ${quality}: a ${lower} with a ${upper} on top.`,
    sound: [notes],
    meta: { root, quality },
  };
}

function whichChord(tonic, degree, random) {
  const chords = diatonicChords(tonic, 'major');
  const chord = chords[degree - 1];
  // Wrong options: the nearest neighbors in the same key.
  const wrong = [1, -1, 2].map((offset) => chords[(degree - 1 + offset + 7) % 7]);
  const { options, answer } = withAnswer(prettyName(chord.name), wrong.map((c) => prettyName(c.name)), random);
  return {
    kind: 'which-chord',
    prompt: `Which chord is ${chord.roman} in ${prettyName(tonic)} major?`,
    options,
    answer,
    explanation: `${chord.roman} is built on the ${ORDINALS[degree - 1]} note of ${prettyName(tonic)} major: ${noteList(chord.notes)}.`,
    sound: [chord.notes],
    meta: { tonic, degree },
  };
}

function chordNotes(tonic, degree, random) {
  const chords = diatonicChords(tonic, 'major');
  const chord = chords[degree - 1];
  // Wrong options: the same root with the other third, and the neighboring chords.
  const flipped = buildTriad(chord.notes[0], FLIP_THIRD[chord.quality]);
  const neighbors = [-1, 1].map((offset) => chords[(degree - 1 + offset + 7) % 7].notes);
  const { options, answer } = withAnswer(noteList(chord.notes), [flipped, ...neighbors].map(noteList), random);
  return {
    kind: 'chord-notes',
    prompt: `What are the notes of ${chord.roman} in ${prettyName(tonic)} major?`,
    options,
    answer,
    explanation: `Stack thirds from ${prettyName(chord.notes[0])} using only the notes of ${prettyName(tonic)} major: ${noteList(chord.notes)}.`,
    sound: [chord.notes],
    meta: { tonic, degree },
  };
}

function qualityOfDegree(degree) {
  const chord = diatonicChords('C', 'major')[degree - 1];
  return {
    kind: 'quality',
    prompt: `What is the quality of the ${ORDINALS[degree - 1]} chord in a major key?`,
    options: QUALITY_OPTIONS,
    answer: QUALITIES.indexOf(chord.quality),
    explanation: `In every major key: major on I, IV and V, minor on ii, iii and vi, diminished on vii°. In C major the ${ORDINALS[degree - 1]} chord is ${prettyName(chord.name)}.`,
    sound: [chord.notes],
    meta: { degree },
  };
}

function relativeMinorOf(tonic, random) {
  const scale = spellScale(tonic, 'major');
  const relative = relativeMinor(tonic);
  // Wrong options: the parallel minor, and the other minor chords of the key (ii and iii).
  const wrong = [tonic, scale[1], scale[2]].map((note) => `${prettyName(note)} minor`);
  const { options, answer } = withAnswer(`${prettyName(relative)} minor`, wrong, random);
  return {
    kind: 'relative-minor',
    prompt: `What is the relative minor of ${prettyName(tonic)} major?`,
    options,
    answer,
    explanation: `Start ${prettyName(tonic)} major on its 6th note and you get ${prettyName(relative)} minor: the same notes, a different home.`,
    sound: [buildTriad(tonic, 'major'), buildTriad(relative, 'minor')],
    meta: { tonic },
  };
}

function withAnswer(right, wrong, random) {
  const options = shuffle([right, ...wrong], random);
  return { options, answer: options.indexOf(right) };
}

function noteList(notes) {
  return notes.map(prettyName).join(' ');
}

function shuffle(list, random) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
