// A progression's tension as bars: one per chord, as high as its tension (0 to `max`),
// colored by function, with the numeral underneath and an optional note (e.g. "leans
// towards V"). setActive(index) highlights the bar of the chord that is playing.

import { h } from './dom.js';

export function createTensionCurve({ max = 4 } = {}) {
  let bars = [];
  const element = h('div', { class: 'tension', role: 'img' });

  return {
    element,

    /** chords: [{ roman, family, tension, note? }] */
    render(chords) {
      element.setAttribute('aria-label',
        `Tension: ${chords.map((c) => `${c.roman} ${c.tension}`).join(', ')}, from 0 (home) to ${max}`);
      bars = chords.map(({ roman, family, tension, note }) =>
        h('div', { class: 'tension__column' },
          h('div', { class: 'tension__track' },
            h('span', { class: 'tension__value' }, String(tension)),
            h('div', { class: 'tension__bar', 'data-function': family, style: `height: ${(tension / max) * 100}%` })),
          h('span', { class: 'tension__numeral' }, roman),
          note ? h('span', { class: 'tension__note' }, note) : null));
      element.replaceChildren(...bars);
    },

    setActive(index) {
      bars.forEach((bar, i) => bar.classList.toggle('is-active', i === index));
    },
  };
}
