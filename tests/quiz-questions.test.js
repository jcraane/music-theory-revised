import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createQuestions } from '../js/lessons/01-keys-and-chords/quiz-questions.js';
import { diatonicChords, chordQuality } from '../js/theory/chords.js';
import { relativeMinor } from '../js/theory/scales.js';
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

const THEORY_KINDS = ['which-chord', 'chord-notes', 'quality', 'relative-minor'];
const correct = (q) => q.options[q.answer];

describe('createQuestions', () => {
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

  test('ear questions cover major, minor and diminished', () => {
    for (let seed = 0; seed < 50; seed++) {
      const qualities = new Set(createQuestions(seeded(seed)).filter((q) => q.kind === 'ear').map((q) => correct(q)));
      assert.deepEqual([...qualities].sort(), ['Diminished', 'Major', 'Minor']);
    }
  });

  test('every question is well formed, over many quizzes', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const q of createQuestions(seeded(seed))) {
        const expected = q.kind === 'ear' || q.kind === 'quality' ? 3 : 4;
        assert.equal(q.options.length, expected, `${q.kind}: ${q.options}`);
        assert.equal(new Set(q.options).size, q.options.length, `duplicate options: ${q.options}`);
        assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
        assert.ok(q.prompt.length > 0 && q.explanation.length > 0);
        assert.ok(q.sound.length > 0 && q.sound.every((chord) => chord.length === 3));
      }
    }
  });

  test('ear answers match the chord that plays', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const q of createQuestions(seeded(seed)).filter((x) => x.kind === 'ear')) {
        assert.equal(correct(q).toLowerCase(), chordQuality(q.sound[0]));
      }
    }
  });

  test('theory answers are right and wrong options come from the same key', () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const q of createQuestions(seeded(seed))) {
        const { tonic, degree } = q.meta;
        if (q.kind === 'which-chord') {
          const chords = diatonicChords(tonic, 'major');
          assert.equal(correct(q), prettyName(chords[degree - 1].name));
          for (const option of q.options) assert.ok(chords.some((c) => prettyName(c.name) === option), option);
        }
        if (q.kind === 'chord-notes') {
          assert.equal(correct(q), diatonicChords(tonic, 'major')[degree - 1].notes.map(prettyName).join(' '));
        }
        if (q.kind === 'quality') {
          assert.equal(correct(q).toLowerCase(), diatonicChords('C', 'major')[degree - 1].quality);
        }
        if (q.kind === 'relative-minor') {
          assert.equal(correct(q), `${prettyName(relativeMinor(tonic))} minor`);
          assert.ok(q.options.includes(`${prettyName(tonic)} minor`), 'parallel minor as a distractor');
        }
      }
    }
  });
});
