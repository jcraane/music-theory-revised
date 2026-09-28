// App shell: applies settings, renders the view for the current hash, and cleans up the
// previous view (audio, pianos, listeners) on every navigation.

import { createStore } from './storage.js';
import { parseRoute, lessonHref, resumeSection } from './router.js';
import { lessons, findLesson } from './lessons/registry.js';
import { unlockOnGesture, setVolume } from './audio/engine.js';
import { setDefaultInstrument, stopAll } from './audio/player.js';
import { renderLessonList } from './ui/lesson-list.js';
import { renderLessonSection } from './ui/lesson-view.js';
import { renderSettings } from './ui/settings.js';
import { h } from './ui/dom.js';

const APP_NAME = 'Chord Lab';
const app = document.getElementById('app');
const store = createStore();
let leaveView = null;

function applySettings({ instrument, volume, theme }) {
  setDefaultInstrument(instrument);
  setVolume(volume);
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

function renderNotFound(container) {
  container.replaceChildren(
    h('h1', { tabindex: '-1' }, 'Page not found'),
    h('p', {}, h('a', { href: '#/' }, 'Back to lessons')),
  );
  return { title: 'Page not found' };
}

function route() {
  const target = parseRoute(location.hash);

  if (target.view === 'lesson') {
    const lesson = findLesson(target.lessonId);
    if (lesson && !target.sectionId) {
      // Pick up where the user left off, without adding a history entry.
      location.replace(lessonHref(lesson.id, resumeSection(lesson, store.completedSections(lesson.id))));
      return;
    }
  }

  leaveView?.();
  leaveView = null;
  stopAll();

  let view;
  if (target.view === 'list') {
    view = renderLessonList(app, { lessons, store });
  } else if (target.view === 'lesson') {
    const lesson = findLesson(target.lessonId);
    const section = lesson?.sections.find((s) => s.id === target.sectionId);
    view = section
      ? renderLessonSection(app, { lesson, section, store, lessonNumber: lessons.indexOf(lesson) + 1 })
      : renderNotFound(app);
  } else {
    view = renderNotFound(app);
  }

  leaveView = view.leave ?? null;
  document.title = `${view.title} · ${APP_NAME}`;
  window.scrollTo(0, 0);
  // Move focus to the new heading so screen readers announce the page change.
  app.querySelector('h1')?.focus({ preventScroll: true });
}

applySettings(store.settings);
store.onSettingsChange(applySettings);
renderSettings(document.querySelector('.site-header'), store);
unlockOnGesture();
window.addEventListener('hashchange', route);
route();
