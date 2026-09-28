// Settings, completed sections and quiz best scores, saved under one versioned
// localStorage key. Missing or corrupt data falls back to defaults field by field, and a
// failing backend (private mode, full quota) leaves the app working in memory.

import { instruments } from './audio/instruments.js';

export const STORAGE_KEY = 'chordlab:v1';
const VERSION = 1;

export const DEFAULT_SETTINGS = Object.freeze({
  instrument: 'keys',
  volume: 0.8,
  theme: 'system',
  noteNames: 'highlighted',
});

const SETTING_RULES = {
  instrument: (v) => typeof v === 'string' && v in instruments,
  volume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
  theme: (v) => ['system', 'light', 'dark'].includes(v),
  noteNames: (v) => ['none', 'highlighted', 'all'].includes(v),
};

export function createStore(backend = browserStorage()) {
  let data = load(backend);
  const listeners = new Set();

  function save() {
    try {
      backend?.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, ...data }));
    } catch {
      // Keep going in memory.
    }
  }

  return {
    get settings() {
      return { ...data.settings };
    },

    /** Merges valid settings; throws on unknown keys or invalid values. */
    updateSettings(patch) {
      for (const [key, value] of Object.entries(patch)) {
        if (!(key in SETTING_RULES)) throw new Error(`Unknown setting: ${key}`);
        if (!SETTING_RULES[key](value)) throw new Error(`Invalid value for ${key}: ${value}`);
      }
      data.settings = { ...data.settings, ...patch };
      save();
      const settings = { ...data.settings };
      listeners.forEach((fn) => fn(settings));
    },

    /** Calls fn(settings) after every change; returns a function that unsubscribes. */
    onSettingsChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    completedSections(lessonId) {
      return [...(data.progress[lessonId] ?? [])];
    },

    isSectionComplete(lessonId, sectionId) {
      return (data.progress[lessonId] ?? []).includes(sectionId);
    },

    completeSection(lessonId, sectionId) {
      const done = data.progress[lessonId] ?? [];
      if (done.includes(sectionId)) return;
      data.progress[lessonId] = [...done, sectionId];
      save();
    },

    bestScore(lessonId) {
      const best = data.quiz[lessonId];
      return best ? { ...best } : null;
    },

    /** Stores the score if it beats the best so far; returns whether it did. */
    recordScore(lessonId, score, total) {
      if (!isValidScore({ score, total })) throw new Error(`Invalid score: ${score} of ${total}`);
      const best = data.quiz[lessonId];
      if (best && best.score / best.total >= score / total) return false;
      data.quiz[lessonId] = { score, total };
      save();
      return true;
    },

    reset() {
      data = emptyData();
      try {
        backend?.removeItem(STORAGE_KEY);
      } catch {
        // Nothing stored to clear.
      }
      const settings = { ...data.settings };
      listeners.forEach((fn) => fn(settings));
    },
  };
}

function load(backend) {
  let parsed;
  try {
    parsed = JSON.parse(backend?.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return emptyData();
  }
  if (!isObject(parsed) || parsed.version !== VERSION) return emptyData();

  const data = emptyData();
  if (isObject(parsed.settings)) {
    for (const [key, isValid] of Object.entries(SETTING_RULES)) {
      if (isValid(parsed.settings[key])) data.settings[key] = parsed.settings[key];
    }
  }
  if (isObject(parsed.progress)) {
    for (const [lessonId, sections] of Object.entries(parsed.progress)) {
      if (Array.isArray(sections)) data.progress[lessonId] = [...new Set(sections.filter((s) => typeof s === 'string'))];
    }
  }
  if (isObject(parsed.quiz)) {
    for (const [lessonId, best] of Object.entries(parsed.quiz)) {
      if (isObject(best) && isValidScore(best)) data.quiz[lessonId] = { score: best.score, total: best.total };
    }
  }
  return data;
}

// Maps keyed by lesson id have no prototype, so an id like "__proto__" is just a key.
function emptyData() {
  return { settings: { ...DEFAULT_SETTINGS }, progress: Object.create(null), quiz: Object.create(null) };
}

function isValidScore({ score, total }) {
  return Number.isInteger(score) && Number.isInteger(total) && total > 0 && score >= 0 && score <= total;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function browserStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
