import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { createStore, STORAGE_KEY, DEFAULT_SETTINGS } from '../js/storage.js';

function memoryBackend(initial) {
  const data = new Map(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    raw: () => data.get(STORAGE_KEY),
  };
}

describe('settings', () => {
  test('defaults when nothing is stored', () => {
    const store = createStore(memoryBackend());
    assert.deepEqual(store.settings, DEFAULT_SETTINGS);
  });

  test('updates are saved and survive a reload', () => {
    const backend = memoryBackend();
    createStore(backend).updateSettings({ instrument: 'pad', volume: 0.5 });
    const reloaded = createStore(backend);
    assert.equal(reloaded.settings.instrument, 'pad');
    assert.equal(reloaded.settings.volume, 0.5);
    assert.equal(reloaded.settings.theme, DEFAULT_SETTINGS.theme);
  });

  test('settings are returned as a copy', () => {
    const store = createStore(memoryBackend());
    store.settings.volume = 0;
    assert.equal(store.settings.volume, DEFAULT_SETTINGS.volume);
  });

  test('rejects invalid values', () => {
    const store = createStore(memoryBackend());
    assert.throws(() => store.updateSettings({ instrument: 'banjo' }));
    assert.throws(() => store.updateSettings({ volume: 2 }));
    assert.throws(() => store.updateSettings({ theme: 'blue' }));
    assert.throws(() => store.updateSettings({ noteNames: 'some' }));
    assert.throws(() => store.updateSettings({ unknown: 1 }));
  });

  test('notifies listeners until they unsubscribe', () => {
    const store = createStore(memoryBackend());
    const seen = [];
    const unsubscribe = store.onSettingsChange((settings) => seen.push(settings.theme));
    store.updateSettings({ theme: 'dark' });
    unsubscribe();
    store.updateSettings({ theme: 'light' });
    assert.deepEqual(seen, ['dark']);
  });
});

describe('progress', () => {
  test('completing a section is saved once', () => {
    const backend = memoryBackend();
    const store = createStore(backend);
    store.completeSection('keys-and-chords', 'major-scale');
    store.completeSection('keys-and-chords', 'major-scale');
    store.completeSection('keys-and-chords', 'building-a-triad');

    const reloaded = createStore(backend);
    assert.deepEqual(reloaded.completedSections('keys-and-chords'), ['major-scale', 'building-a-triad']);
    assert.equal(reloaded.isSectionComplete('keys-and-chords', 'major-scale'), true);
    assert.equal(reloaded.isSectionComplete('keys-and-chords', 'minor-keys'), false);
    assert.deepEqual(reloaded.completedSections('other'), []);
  });
});

describe('quiz scores', () => {
  test('keeps the best score', () => {
    const backend = memoryBackend();
    const store = createStore(backend);
    assert.equal(store.bestScore('keys-and-chords'), null);
    assert.equal(store.recordScore('keys-and-chords', 5, 8), true);
    assert.equal(store.recordScore('keys-and-chords', 3, 8), false);
    assert.equal(store.recordScore('keys-and-chords', 7, 8), true);
    assert.deepEqual(createStore(backend).bestScore('keys-and-chords'), { score: 7, total: 8 });
  });

  test('rejects impossible scores', () => {
    const store = createStore(memoryBackend());
    assert.throws(() => store.recordScore('x', 9, 8));
    assert.throws(() => store.recordScore('x', 1, 0));
    assert.throws(() => store.recordScore('x', -1, 8));
  });
});

describe('missing or corrupt data', () => {
  test('invalid JSON falls back to defaults', () => {
    const store = createStore(memoryBackend('{not json'));
    assert.deepEqual(store.settings, DEFAULT_SETTINGS);
    assert.deepEqual(store.completedSections('keys-and-chords'), []);
  });

  test('another version falls back to defaults', () => {
    const store = createStore(memoryBackend(JSON.stringify({ version: 99, settings: { volume: 0.1 } })));
    assert.deepEqual(store.settings, DEFAULT_SETTINGS);
  });

  test('keeps the valid parts of partly broken data', () => {
    const stored = {
      version: 1,
      settings: { instrument: 'pad', volume: 'loud', theme: 'dark', noteNames: 42 },
      progress: { 'keys-and-chords': ['major-scale', 7, null], broken: 'yes' },
      quiz: { 'keys-and-chords': { score: 6, total: 8 }, bad: { score: 9, total: 8 } },
    };
    const store = createStore(memoryBackend(JSON.stringify(stored)));
    assert.deepEqual(store.settings, { ...DEFAULT_SETTINGS, instrument: 'pad', theme: 'dark' });
    assert.deepEqual(store.completedSections('keys-and-chords'), ['major-scale']);
    assert.deepEqual(store.completedSections('broken'), []);
    assert.deepEqual(store.bestScore('keys-and-chords'), { score: 6, total: 8 });
    assert.equal(store.bestScore('bad'), null);
  });

  test('non-object JSON falls back to defaults', () => {
    for (const raw of ['null', '[]', '"text"', '3']) {
      assert.deepEqual(createStore(memoryBackend(raw)).settings, DEFAULT_SETTINGS);
    }
  });

  test('keeps working in memory when the backend fails', () => {
    const failing = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('quota'); },
      removeItem() { throw new Error('blocked'); },
    };
    const store = createStore(failing);
    store.updateSettings({ volume: 0.3 });
    store.completeSection('a', 'b');
    assert.equal(store.settings.volume, 0.3);
    assert.equal(store.isSectionComplete('a', 'b'), true);
  });

  test('reset clears everything', () => {
    const backend = memoryBackend();
    const store = createStore(backend);
    store.updateSettings({ theme: 'dark' });
    store.completeSection('a', 'b');
    store.reset();
    assert.deepEqual(store.settings, DEFAULT_SETTINGS);
    assert.deepEqual(createStore(backend).completedSections('a'), []);
  });
});
