// The lessons in the app, in order.

import keysAndChords from './01-keys-and-chords/index.js';
import harmonicFunction from './02-harmonic-function/index.js';

export const lessons = [keysAndChords, harmonicFunction];

export function findLesson(id) {
  return lessons.find((lesson) => lesson.id === id) ?? null;
}
