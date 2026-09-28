// The home view: every lesson with its progress and a link to pick up where you left off.

import { h } from './dom.js';
import { lessonHref, resumeSection } from '../router.js';

export function renderLessonList(container, { lessons, store }) {
  const items = lessons.map((lesson, i) => {
    const done = store.completedSections(lesson.id).filter((id) => lesson.sections.some((s) => s.id === id));
    const total = lesson.sections.length;
    const best = store.bestScore(lesson.id);
    const action = done.length === 0 ? 'Start' : done.length === total ? 'Review' : 'Continue';

    return h('li', { class: 'lesson-card' },
      h('a', { class: 'lesson-card__link', href: lessonHref(lesson.id, resumeSection(lesson, done)) },
        h('span', { class: 'lesson-card__number', 'aria-hidden': 'true' }, String(i + 1).padStart(2, '0')),
        h('div', { class: 'lesson-card__body' },
          h('h2', { class: 'lesson-card__title' }, lesson.title),
          h('p', { class: 'lesson-card__summary' }, lesson.summary),
          h('div', { class: 'lesson-card__progress' },
            h('span', { class: 'progress-bar', 'aria-hidden': 'true' },
              h('span', { class: 'progress-bar__fill', style: `width: ${(done.length / total) * 100}%` })),
            h('span', {}, `${done.length} of ${total} sections done`),
            best && h('span', {}, ` · Quiz best: ${best.score} of ${best.total}`)),
        ),
        h('span', { class: 'lesson-card__action' }, action),
      ),
    );
  });

  container.replaceChildren(
    h('h1', { tabindex: '-1' }, 'Lessons'),
    h('ol', { class: 'lesson-list' }, items),
  );
  return { title: 'Lessons' };
}
