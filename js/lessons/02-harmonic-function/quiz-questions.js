// Quiz questions for lesson 02, generated from the theory engine so every attempt differs.
// Pure: pass a random function (0 ≤ x < 1) to get a reproducible quiz.
//
// A question is { kind, prompt, options, answer, explanation, sound, answerSound, meta }:
// options are display strings and answer is the index of the right one. sound is what plays
// for the question and answerSound what plays after answering, both as { tonic, degrees }
// in a major key.

import { spellScale, leadingTone, commonTonics } from '../../theory/scales.js';
import { diatonicChords, commonTones } from '../../theory/chords.js';
import { parseNote, noteName } from '../../theory/notes.js';
import { functionOf } from '../../theory/harmony.js';
import { prettyName } from '../../ui/format.js';

export const HOME_PATTERNS = [[1, 4, 5, 1], [1, 2, 5, 1], [6, 4, 5, 1]];
export const HANGING_PATTERNS = [[1, 6, 4, 5], [1, 4, 2, 5], [1, 3, 4, 5]];

const FAMILIES = ['tonic', 'subdominant', 'dominant'];
const FAMILY_OPTIONS = ['Tonic', 'Subdominant', 'Dominant'];
const FAMILY_JOB = {
  tonic: 'it feels at rest, like home',
  subdominant: 'it moves away from home',
  dominant: 'it builds tension that wants to resolve home',
};
const DEGREES = [1, 2, 3, 4, 5, 6, 7];

export function createQuestions(random = Math.random) {
  const pick = (list) => list[Math.floor(random() * list.length)];
  const tonics = commonTonics('major');

  // Every attempt has at least one ending of each kind.
  const endings = shuffle(['home', 'hanging', pick(['home', 'hanging']), pick(['home', 'hanging'])], random);
  const ear = endings.map((ending) =>
    earQuestion(pick(tonics), pick(ending === 'home' ? HOME_PATTERNS : HANGING_PATTERNS), ending));

  const theory = [
    functionQuestion(pick(tonics), pick(DEGREES)),
    standInQuestion(pick(tonics), pick([1, 4, 5]), random),
    leadingToneQuestion(pick(tonics), random),
    dominantQuestion(pick(tonics), random),
  ];

  return shuffle([...ear, ...theory], random);
}

function earQuestion(tonic, degrees, ending) {
  const chords = diatonicChords(tonic, 'major');
  const names = degrees.map((d) => prettyName(chords[d - 1].name)).join(', ');
  const last = chords[degrees.at(-1) - 1];
  const home = ending === 'home';
  return {
    kind: 'ear',
    prompt: 'Listen. Does this progression end at home or hanging?',
    listenLabel: 'Play the progression',
    options: ['Home', 'Hanging'],
    answer: home ? 0 : 1,
    explanation: home
      ? `${names} in ${prettyName(tonic)} major ends on I, ${prettyName(last.name)}: home.`
      : `${names} in ${prettyName(tonic)} major ends on V, ${prettyName(last.name)}, which leaves it hanging. Hear it resolve to I.`,
    sound: { tonic, degrees },
    answerSound: { tonic, degrees: home ? degrees : [...degrees, 1] },
    meta: { tonic, degrees, ending },
  };
}

function functionQuestion(tonic, degree) {
  const chord = diatonicChords(tonic, 'major')[degree - 1];
  const { family } = functionOf(degree, 'major');
  return {
    kind: 'function',
    prompt: `What is the function of ${chord.roman} in ${prettyName(tonic)} major?`,
    options: FAMILY_OPTIONS,
    answer: FAMILIES.indexOf(family),
    explanation: `${chord.roman}, ${prettyName(chord.name)}, is in the ${family} family: ${FAMILY_JOB[family]}.`,
    sound: { tonic, degrees: [degree] },
    answerSound: { tonic, degrees: [degree] },
    meta: { tonic, degree },
  };
}

function standInQuestion(tonic, degree, random) {
  const chords = diatonicChords(tonic, 'major');
  const head = chords[degree - 1];
  const { family } = functionOf(degree, 'major');
  const members = DEGREES.filter((d) => d !== degree && functionOf(d, 'major').family === family);
  const others = DEGREES.filter((d) => functionOf(d, 'major').family !== family);
  const standIn = chords[members[Math.floor(random() * members.length)] - 1];
  const wrong = shuffle(others, random).slice(0, 3).map((d) => prettyName(chords[d - 1].name));
  const { options, answer } = withAnswer(prettyName(standIn.name), wrong, random);
  const shared = commonTones(standIn.notes, head.notes).map(prettyName).join(' and ');
  return {
    kind: 'stand-in',
    prompt: `Which chord can stand in for ${head.roman} in ${prettyName(tonic)} major?`,
    options,
    answer,
    explanation: `${prettyName(standIn.name)} (${standIn.roman}) shares ${shared} with ${prettyName(head.name)}, so it belongs to the same family: ${family}.`,
    sound: { tonic, degrees: [degree, standIn.degree] },
    answerSound: { tonic, degrees: [degree, standIn.degree] },
    meta: { tonic, degree },
  };
}

function leadingToneQuestion(tonic, random) {
  const scale = spellScale(tonic, 'major');
  const right = leadingTone(tonic);
  const { letter, offset } = parseNote(right);
  const wrong = [tonic, scale[5], noteName(letter, offset - 1)];
  const { options, answer } = withAnswer(prettyName(right), wrong.map(prettyName), random);
  return {
    kind: 'leading-tone',
    prompt: `Which note is the leading tone in ${prettyName(tonic)} major?`,
    options,
    answer,
    explanation: `${prettyName(right)} is the 7th note of ${prettyName(tonic)} major, a half step below ${prettyName(tonic)}. It's the third of V and wants to rise to the tonic.`,
    sound: { tonic, degrees: [5, 1] },
    answerSound: { tonic, degrees: [5, 1] },
    meta: { tonic },
  };
}

function dominantQuestion(tonic, random) {
  const chords = diatonicChords(tonic, 'major');
  const name = (d) => prettyName(chords[d - 1].name);
  const { options, answer } = withAnswer(name(5), [4, 7, 1].map(name), random);
  return {
    kind: 'dominant',
    prompt: `Which chord is the dominant in ${prettyName(tonic)} major?`,
    options,
    answer,
    explanation: `The dominant is V, the chord on the 5th note of the key: ${name(5)}. It pulls back home to ${name(1)}.`,
    sound: { tonic, degrees: [5, 1] },
    answerSound: { tonic, degrees: [5, 1] },
    meta: { tonic },
  };
}

function withAnswer(right, wrong, random) {
  const options = shuffle([right, ...wrong], random);
  return { options, answer: options.indexOf(right) };
}

function shuffle(list, random) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
