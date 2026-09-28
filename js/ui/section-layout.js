// The hear → see → read → try layout every lesson section uses.
// Returns the containers for the visual and the interaction, which the section fills in,
// and the caption element so it can follow the selected key.

import { h } from './dom.js';
import { createPlayButton } from './play-button.js';

export function sectionLayout(container, { listen, caption, read }) {
  const see = h('div', { class: 'lesson-part lesson-part--see' });
  const tryIt = h('div', { class: 'lesson-part__body' });
  const captionEl = h('p', { class: 'lesson-part__caption' }, caption);

  container.append(
    h('div', { class: 'lesson-part lesson-part--hear' },
      createPlayButton({ play: listen, shortcut: true }).element,
      captionEl),
    see,
    h('div', { class: 'lesson-part lesson-part--read' }, read.map((text) => h('p', {}, text))),
    h('section', { class: 'lesson-part lesson-part--try' },
      h('h2', { class: 'lesson-part__title' }, 'Try it'),
      tryIt),
  );

  return { see, tryIt, caption: captionEl };
}
