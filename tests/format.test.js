import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { prettyName, functionLabel } from '../js/ui/format.js';

describe('prettyName', () => {
  test('note names use sharp and flat signs', () => {
    assert.equal(prettyName('C'), 'C');
    assert.equal(prettyName('Eb'), 'E♭');
    assert.equal(prettyName('F#'), 'F♯');
    assert.equal(prettyName('F##'), 'F𝄪');
    assert.equal(prettyName('Bbb'), 'B𝄫');
  });

  test('chord names keep their suffix', () => {
    assert.equal(prettyName('Bbm'), 'B♭m');
    assert.equal(prettyName('F#m'), 'F♯m');
    assert.equal(prettyName('Bdim'), 'Bdim');
    assert.equal(prettyName('Bbdim'), 'B♭dim');
    assert.equal(prettyName('Ab'), 'A♭');
  });

  test('leaves anything else alone', () => {
    assert.equal(prettyName('vii°'), 'vii°');
    assert.equal(prettyName(''), '');
  });
});

describe('functionLabel', () => {
  test('names the family', () => {
    assert.equal(functionLabel({ family: 'tonic', strength: 'normal' }), 'tonic');
    assert.equal(functionLabel({ family: 'subdominant', strength: 'normal' }), 'subdominant');
    assert.equal(functionLabel({ family: 'dominant', strength: 'normal' }), 'dominant');
  });

  test('marks weak dominants', () => {
    assert.equal(functionLabel({ family: 'dominant', strength: 'weak' }), 'weak dominant');
  });
});
