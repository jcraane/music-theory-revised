// One lesson section: header, section steps, the section's own content, and
// previous/next navigation. Moving on with Next (or Finish) marks the section as done.

import { h } from './dom.js';
import { createPiano } from './piano.js';
import { lessonHref, sectionNeighbors } from '../router.js';
import * as player from '../audio/player.js';
import * as notes from '../theory/notes.js';
import * as scales from '../theory/scales.js';
import * as chords from '../theory/chords.js';

const theory = Object.freeze({ ...notes, ...scales, ...chords });

export function renderLessonSection(container, { lesson, section, store, lessonNumber }) {
  const { index, previous, next } = sectionNeighbors(lesson, section.id);
  const total = lesson.sections.length;
  const complete = () => store.completeSection(lesson.id, section.id);

  const steps = h('ol', { class: 'section-steps' },
    lesson.sections.map((s, i) => {
      const done = store.isSectionComplete(lesson.id, s.id);
      const current = s.id === section.id;
      return h('li', {},
        h('a', {
          class: `section-steps__link${done ? ' is-done' : ''}`,
          href: lessonHref(lesson.id, s.id),
          'aria-current': current ? 'step' : null,
          'aria-label': `${i + 1}. ${s.title}${done ? ', done' : ''}`,
          title: s.title,
        }, String(i + 1)),
      );
    }),
  );

  const body = h('div', { class: 'section-body' });
  const nav = h('nav', { class: 'section-nav', 'aria-label': 'Sections' },
    previous
      ? h('a', { class: 'button', href: lessonHref(lesson.id, previous.id) }, 'Previous')
      : h('span'),
    next
      ? h('a', { class: 'button button--primary', href: lessonHref(lesson.id, next.id), onclick: complete }, `Next: ${next.title}`)
      : h('a', { class: 'button button--primary', href: '#/', onclick: complete }, 'Finish lesson'),
  );

  container.replaceChildren(
    h('nav', { class: 'crumbs', 'aria-label': 'Breadcrumb' }, h('a', { href: '#/' }, 'Lessons')),
    h('header', { class: 'lesson-header' },
      h('p', { class: 'lesson-header__lesson' }, `Lesson ${lessonNumber}: ${lesson.title}`),
      steps,
      h('p', { class: 'lesson-header__count' }, `Section ${index + 1} of ${total}`),
      h('h1', { tabindex: '-1' }, section.title),
    ),
    body,
    nav,
  );

  const { ctx, leave } = createContext({ lesson, section, store, complete });
  try {
    section.render(body, ctx);
  } catch (error) {
    console.error(error);
    body.replaceChildren(h('p', { class: 'error' }, 'Something went wrong in this section.'));
  }

  return { title: `${section.title} · ${lesson.title}`, leave };
}

/**
 * What a section gets to work with. Everything it starts through ctx is cleaned up when
 * the user leaves: audio stops, pianos are removed, and ctx.signal aborts so listeners
 * added with { signal: ctx.signal } go away.
 */
function createContext({ lesson, section, store, complete }) {
  const controller = new AbortController();
  const pianos = new Set();

  const unsubscribe = store.onSettingsChange((settings) => {
    pianos.forEach((piano) => piano.setLabels(settings.noteNames));
  });

  const ctx = {
    lesson,
    section,
    audio: player,
    theory,
    storage: store,
    get settings() {
      return store.settings;
    },
    signal: controller.signal,
    complete,
    createPiano(target, options = {}) {
      const piano = createPiano(target, { labels: store.settings.noteNames, ...options });
      pianos.add(piano);
      return piano;
    },
  };

  const leave = () => {
    controller.abort();
    unsubscribe();
    player.stopAll();
    pianos.forEach((piano) => piano.destroy());
    pianos.clear();
  };

  return { ctx, leave };
}
