import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { keyLayout, isBlack, defaultNoteName, octaveOf, spokenName } from '../js/ui/piano.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≉ ${expected}`);

describe('isBlack', () => {
  test('black keys in an octave', () => {
    const black = Array.from({ length: 12 }, (_, i) => isBlack(60 + i));
    assert.deepEqual(black, [false, true, false, true, false, false, true, false, true, false, true, false]);
  });
});

describe('defaultNoteName and octaveOf', () => {
  test('sharps for black keys, C4 = 60', () => {
    assert.equal(defaultNoteName(60), 'C');
    assert.equal(defaultNoteName(61), 'C#');
    assert.equal(defaultNoteName(71), 'B');
    assert.equal(octaveOf(60), 4);
    assert.equal(octaveOf(59), 3);
    assert.equal(octaveOf(0), -1);
  });
});

describe('spokenName', () => {
  test('spells out accidentals for screen readers', () => {
    assert.equal(spokenName('C'), 'C');
    assert.equal(spokenName('Eb'), 'E flat');
    assert.equal(spokenName('F#'), 'F sharp');
    assert.equal(spokenName('F##'), 'F double sharp');
    assert.equal(spokenName('Bbb'), 'B double flat');
  });
});

describe('keyLayout', () => {
  test('two octaves from C4', () => {
    const keys = keyLayout(60, 2);
    assert.equal(keys.length, 24);
    assert.equal(keys[0].midi, 60);
    assert.equal(keys.at(-1).midi, 83);
    assert.equal(keys.filter((k) => !k.black).length, 14);
  });

  test('white keys share the width evenly', () => {
    const keys = keyLayout(60, 2);
    const w = 100 / 14;
    const whites = keys.filter((k) => !k.black);
    whites.forEach((k, i) => {
      close(k.left, i * w);
      close(k.width, w);
    });
  });

  test('black keys sit centered on the line between two white keys', () => {
    const keys = keyLayout(60, 1);
    const w = 100 / 7;
    const cSharp = keys.find((k) => k.midi === 61);
    const aSharp = keys.find((k) => k.midi === 70);
    assert.equal(cSharp.black, true);
    close(cSharp.left + cSharp.width / 2, w);
    close(aSharp.left + aSharp.width / 2, 6 * w);
    assert.ok(cSharp.width < w);
  });

  test('can start on any white key', () => {
    const keys = keyLayout(48, 3);
    assert.equal(keys[0].midi, 48);
    assert.equal(keys.length, 36);
    const fromF = keyLayout(53, 1);
    assert.equal(fromF[0].midi, 53);
    assert.equal(fromF.at(-1).midi, 64);
  });

  test('rejects a black starting key or a non-positive range', () => {
    assert.throws(() => keyLayout(61, 2));
    assert.throws(() => keyLayout(60, 0));
  });
});
