import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { staffStep, ledgerSteps, accidentalColumns, splitSystems } from '../js/ui/staff.js';

describe('staffStep', () => {
  test('diatonic steps from the bottom line of the treble staff (E4)', () => {
    assert.equal(staffStep({ midi: 64, name: 'E' }), 0);
    assert.equal(staffStep({ midi: 65, name: 'F' }), 1);
    assert.equal(staffStep({ midi: 77, name: 'F' }), 8); // top line
    assert.equal(staffStep({ midi: 60, name: 'C' }), -2); // middle C
    assert.equal(staffStep({ midi: 55, name: 'G' }), -5);
  });

  test('the letter decides the position, not the pitch', () => {
    assert.equal(staffStep({ midi: 61, name: 'C#' }), -2);
    assert.equal(staffStep({ midi: 61, name: 'Db' }), -1);
    assert.equal(staffStep({ midi: 60, name: 'B#' }), -3);
    assert.equal(staffStep({ midi: 59, name: 'Cb' }), -2);
  });
});

describe('ledgerSteps', () => {
  test('no ledger lines on the staff', () => {
    for (let step = -1; step <= 9; step++) assert.deepEqual(ledgerSteps(step), [], `step ${step}`);
  });

  test('below the staff', () => {
    assert.deepEqual(ledgerSteps(-2), [-2]);
    assert.deepEqual(ledgerSteps(-3), [-2]);
    assert.deepEqual(ledgerSteps(-4), [-2, -4]);
    assert.deepEqual(ledgerSteps(-5), [-2, -4]);
  });

  test('above the staff', () => {
    assert.deepEqual(ledgerSteps(10), [10]);
    assert.deepEqual(ledgerSteps(11), [10]);
    assert.deepEqual(ledgerSteps(14), [10, 12, 14]);
  });
});

describe('accidentalColumns', () => {
  test('no accidentals, no columns', () => {
    assert.deepEqual(accidentalColumns([{ step: 0, accidental: 0 }, { step: 2, accidental: 0 }]), [null, null]);
  });

  test('accidentals a seventh or more apart share a column', () => {
    assert.deepEqual(accidentalColumns([{ step: 0, accidental: 1 }, { step: 6, accidental: 1 }]), [0, 0]);
  });

  test('closer accidentals are staggered, top note nearest the notes', () => {
    // F# A C#
    assert.deepEqual(accidentalColumns([{ step: 1, accidental: 1 }, { step: 3, accidental: 0 }, { step: 5, accidental: 1 }]), [1, null, 0]);
  });

  test('three accidentals: top, then bottom, then middle furthest out', () => {
    // D# F# A#
    assert.deepEqual(accidentalColumns([{ step: -1, accidental: 1 }, { step: 1, accidental: 1 }, { step: 3, accidental: 1 }]), [1, 2, 0]);
  });
});

describe('splitSystems', () => {
  const bars = [50, 50, 50, 50, 50, 50, 50];

  test('one system when everything fits', () => {
    assert.deepEqual(splitSystems(bars, 400, 40), [[0, 1, 2, 3, 4, 5, 6]]);
  });

  test('otherwise as few systems as fit, balanced, fuller ones first', () => {
    assert.deepEqual(splitSystems(bars, 300, 40), [[0, 1, 2, 3], [4, 5, 6]]);
    assert.deepEqual(splitSystems(bars, 200, 40), [[0, 1, 2], [3, 4], [5, 6]]);
  });

  test('at least one bar per system, even when a bar does not fit', () => {
    assert.deepEqual(splitSystems([50, 50], 60, 40), [[0], [1]]);
  });

  test('wide bars count by width, not number', () => {
    assert.deepEqual(splitSystems([100, 20, 20, 20, 100], 190, 30), [[0, 1, 2], [3, 4]]);
  });
});
