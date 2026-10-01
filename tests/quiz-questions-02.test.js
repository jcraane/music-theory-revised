import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createQuestions, HOME_PATTERNS, HANGING_PATTERNS } from '../js/lessons/02-harmonic-function/quiz-questions.js';
import { diatonicChords } from '../js/theory/chords.js';
import { leadingTone, spellScale } from '../js/theory/scales.js';
import { semitonesBetween } from '../js/theory/notes.js';
import { functionOf } from '../js/theory/harmony.js';
import { prettyName } from '../js/ui/format.js';

// Small seeded generator so every run sees the same questions.
function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const THEORY_KINDS = ['function', 'stand-in', 'leading-tone', 'dominant'];
const correct = (q) => q.options[q.answer];
const many = (count, kind) => Array.from({ length: count }, (_, seed) => createQuestions(seeded(seed)))
  .flat().filter((q) => !kind || q.kind === kind);
const chordName = (tonic, degree) => prettyName(diatonicChords(tonic, 'major')[degree - 1].name);

describe('lesson 02 createQuestions', () => {
  test('four ear questions and one of each theory type', () => {
    const questions = createQuestions(seeded(1));
    assert.equal(questions.length, 8);
    assert.equal(questions.filter((q) => q.kind === 'ear').length, 4);
    assert.deepEqual(questions.filter((q) => q.kind !== 'ear').map((q) => q.kind).sort(), [...THEORY_KINDS].sort());
  });

  test('the same seed gives the same quiz, another seed a different one', () => {
    assert.deepEqual(createQuestions(seeded(7)), createQuestions(seeded(7)));
    assert.notDeepEqual(createQuestions(seeded(7)), createQuestions(seeded(8)));
  });

  test('every question is well formed, over many quizzes', () => {
    const optionCount = { ear: 2, function: 3, 'stand-in': 4, 'leading-tone': 4, dominant: 4 };
    for (const q of many(300)) {
      assert.equal(q.options.length, optionCount[q.kind], `${q.kind}: ${q.options}`);
      assert.equal(new Set(q.options).size, q.options.length, `duplicate options: ${q.options}`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
      assert.ok(q.prompt.length > 0 && q.explanation.length > 0);
      for (const sound of [q.sound, q.answerSound]) {
        assert.ok(sound.degrees.length > 0 && sound.degrees.every((d) => Number.isInteger(d) && d >= 1 && d <= 7));
        assert.ok(spellScale(sound.tonic, 'major'));
      }
    }
  });
});

describe('lesson 02 ear questions', () => {
  test('every attempt has at least one home and one hanging ending', () => {
    for (let seed = 0; seed < 100; seed++) {
      const answers = new Set(createQuestions(seeded(seed)).filter((q) => q.kind === 'ear').map(correct));
      assert.deepEqual([...answers].sort(), ['Hanging', 'Home']);
    }
  });

  test('progressions come from the patterns, and the answer matches the last chord', () => {
    const key = (degrees) => degrees.join('-');
    const home = new Set(HOME_PATTERNS.map(key));
    const hanging = new Set(HANGING_PATTERNS.map(key));
    for (const q of many(100, 'ear')) {
      const { degrees } = q.sound;
      if (correct(q) === 'Home') {
        assert.ok(home.has(key(degrees)), key(degrees));
        assert.equal(degrees.at(-1), 1);
      } else {
        assert.ok(hanging.has(key(degrees)), key(degrees));
        assert.equal(degrees.at(-1), 5);
      }
    }
  });

  test('after answering, a hanging progression is resolved to I', () => {
    for (const q of many(100, 'ear')) {
      const expected = correct(q) === 'Hanging' ? [...q.sound.degrees, 1] : q.sound.degrees;
      assert.deepEqual(q.answerSound.degrees, expected);
      assert.equal(q.answerSound.tonic, q.sound.tonic);
    }
  });
});

describe('lesson 02 theory questions', () => {
  test('function: the answer is the family of the chord', () => {
    for (const q of many(100, 'function')) {
      assert.deepEqual(q.options, ['Tonic', 'Subdominant', 'Dominant']);
      assert.equal(correct(q).toLowerCase(), functionOf(q.meta.degree, 'major').family);
    }
  });

  test('stand-in: the answer shares the family, the wrong options do not', () => {
    for (const q of many(100, 'stand-in')) {
      const { tonic, degree } = q.meta;
      assert.ok([1, 4, 5].includes(degree));
      const family = functionOf(degree, 'major').family;
      const byName = new Map([1, 2, 3, 4, 5, 6, 7].map((d) => [chordName(tonic, d), d]));
      const right = byName.get(correct(q));
      assert.notEqual(right, degree);
      assert.equal(functionOf(right, 'major').family, family);
      q.options.filter((_, i) => i !== q.answer).forEach((option) => {
        assert.notEqual(functionOf(byName.get(option), 'major').family, family, option);
      });
    }
  });

  test('leading tone: a half step below the tonic, with the tonic among the wrong options', () => {
    for (const q of many(100, 'leading-tone')) {
      const { tonic } = q.meta;
      assert.equal(correct(q), prettyName(leadingTone(tonic)));
      assert.equal(semitonesBetween(leadingTone(tonic), tonic), 1);
      assert.ok(q.options.includes(prettyName(tonic)));
      assert.ok(q.options.includes(prettyName(spellScale(tonic, 'major')[5])));
    }
  });

  test('leading tone: the lowered 7th is spelled on the same letter', () => {
    const q = many(300, 'leading-tone').find((x) => x.meta.tonic === 'G');
    assert.ok(q, 'a G major question within 300 quizzes');
    assert.ok(q.options.includes('F'));
  });

  test('dominant: the answer is V, the wrong options are IV, vii° and I', () => {
    for (const q of many(100, 'dominant')) {
      const { tonic } = q.meta;
      assert.equal(correct(q), chordName(tonic, 5));
      assert.deepEqual(new Set(q.options), new Set([5, 4, 7, 1].map((d) => chordName(tonic, d))));
    }
  });
});
