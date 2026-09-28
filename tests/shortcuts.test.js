import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { shortcutAction } from '../js/shortcuts.js';

const key = (k, extra = {}) => ({ key: k, repeat: false, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, interactive: false, ...extra });

describe('shortcutAction', () => {
  test('space plays when nothing is playing, and stops when something is', () => {
    assert.equal(shortcutAction(key(' '), { playing: false, canPlay: true }), 'play');
    assert.equal(shortcutAction(key(' '), { playing: true, canPlay: true }), 'stop');
  });

  test('space does nothing when there is nothing to play', () => {
    assert.equal(shortcutAction(key(' '), { playing: false, canPlay: false }), null);
  });

  test('escape stops, even from a control', () => {
    assert.equal(shortcutAction(key('Escape', { interactive: true }), { playing: true, canPlay: true }), 'stop');
    assert.equal(shortcutAction(key('Escape'), { playing: false, canPlay: true }), null);
  });

  test('space keeps its normal job on buttons, keys and form fields', () => {
    assert.equal(shortcutAction(key(' ', { interactive: true }), { playing: true, canPlay: true }), null);
  });

  test('ignores held keys and modifier combinations', () => {
    assert.equal(shortcutAction(key(' ', { repeat: true }), { playing: false, canPlay: true }), null);
    for (const mod of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']) {
      assert.equal(shortcutAction(key(' ', { [mod]: true }), { playing: false, canPlay: true }), null, mod);
    }
  });

  test('other keys do nothing', () => {
    assert.equal(shortcutAction(key('a'), { playing: true, canPlay: true }), null);
  });
});
