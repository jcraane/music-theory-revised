// The lessons in the app, in order.

import keysAndChords from './01-keys-and-chords.js';

export const lessons = [keysAndChords];

export function findLesson(id) {
  return lessons.find((lesson) => lesson.id === id) ?? null;
}
