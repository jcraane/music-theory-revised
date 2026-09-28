// Hash routes: #/ (lesson list), #/lesson/<id> and #/lesson/<id>/<section>,
// plus helpers for moving through a lesson's sections.

/** Reads a location hash into { view: 'list' | 'lesson' | 'not-found', lessonId, sectionId }. */
export function parseRoute(hash) {
  if (hash === '' || hash === '#' || hash === '#/') return { view: 'list' };
  if (!hash.startsWith('#/')) return { view: 'not-found' };

  let parts;
  try {
    parts = hash.slice(2).split('/').map(decodeURIComponent);
  } catch {
    return { view: 'not-found' };
  }
  if (parts.at(-1) === '' && parts.length === 3) parts.pop();

  const [view, lessonId, sectionId, ...rest] = parts;
  if (view !== 'lesson' || !lessonId || sectionId === '' || rest.length > 0) return { view: 'not-found' };
  return { view: 'lesson', lessonId, sectionId: sectionId ?? null };
}

export function lessonHref(lessonId, sectionId) {
  const base = `#/lesson/${encodeURIComponent(lessonId)}`;
  return sectionId ? `${base}/${encodeURIComponent(sectionId)}` : base;
}

/** Where to pick a lesson up: the first section not done yet, or the start. */
export function resumeSection(lesson, completedIds) {
  const done = new Set(completedIds);
  return (lesson.sections.find((s) => !done.has(s.id)) ?? lesson.sections[0]).id;
}

/** { index, previous, next } for a section, or null if the lesson has no such section. */
export function sectionNeighbors(lesson, sectionId) {
  const index = lesson.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return null;
  return {
    index,
    previous: lesson.sections[index - 1] ?? null,
    next: lesson.sections[index + 1] ?? null,
  };
}
