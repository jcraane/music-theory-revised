// The usual flow as a diagram: Tonic → Subdominant → Dominant, with an arrow back home.
// Boxes use the function colors; setActive(family) lights up the family that is playing.
// createFlowPath() draws one progression's path the same way, chord by chord, and marks
// moves that run against the flow.

import { h } from './dom.js';

const FAMILIES = [
  { family: 'tonic', name: 'Tonic', role: 'home' },
  { family: 'subdominant', name: 'Subdominant', role: 'away' },
  { family: 'dominant', name: 'Dominant', role: 'tension' },
];
const NAMES = Object.fromEntries(FAMILIES.map(({ family, name }) => [family, name]));

export function createFlowDiagram() {
  const boxes = new Map();
  const items = FAMILIES.flatMap(({ family, name, role }, i) => {
    const box = h('div', { class: 'flow__box', 'data-function': family },
      h('span', { class: 'flow__name' }, name),
      h('span', { class: 'flow__role' }, role));
    boxes.set(family, box);
    return i === 0 ? [box] : [h('span', { class: 'flow__arrow', 'aria-hidden': 'true' }, '→'), box];
  });

  const element = h('div', {
    class: 'flow',
    role: 'img',
    'aria-label': 'The usual flow: tonic, then subdominant, then dominant, and back to tonic',
  },
    items,
    h('div', { class: 'flow__return', 'aria-hidden': 'true' }, h('span', { class: 'flow__return-label' }, 'back home')));

  return {
    element,
    /** Highlights one family ("tonic", "subdominant", "dominant"), or none with null. */
    setActive(family) {
      boxes.forEach((box, key) => box.classList.toggle('is-active', key === family));
    },
  };
}

export function createFlowPath() {
  let steps = [];
  const element = h('ol', { class: 'flow-path' });

  return {
    element,

    /**
     * chords: [{ roman, family }] in order; backwards: [{ from, to }] from flowPath(),
     * the moves that go from a dominant back to a subdominant.
     */
    render(chords, backwards = []) {
      const against = new Set(backwards.map(({ from }) => from));
      steps = chords.map(({ roman, family }) => h('li', { class: 'flow-path__chord', 'data-function': family },
        h('span', { class: 'flow-path__numeral' }, roman),
        h('span', { class: 'flow-path__family' }, NAMES[family])));
      const items = steps.flatMap((step, i) => {
        if (i === 0) return [step];
        const backward = against.has(i - 1);
        return [
          h('li', { class: `flow-path__move${backward ? ' flow-path__move--backwards' : ''}` },
            h('span', { 'aria-hidden': 'true' }, '→'),
            backward
              ? h('span', { class: 'flow-path__move-label' }, 'against the flow')
              : h('span', { class: 'visually-hidden' }, 'then')),
          step,
        ];
      });
      element.replaceChildren(...items);
    },

    setActive(index) {
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    },
  };
}
