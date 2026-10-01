// The usual flow as a diagram: Tonic → Subdominant → Dominant, with an arrow back home.
// Boxes use the function colors; setActive(family) lights up the family that is playing.

import { h } from './dom.js';

const FAMILIES = [
  { family: 'tonic', name: 'Tonic', role: 'home' },
  { family: 'subdominant', name: 'Subdominant', role: 'away' },
  { family: 'dominant', name: 'Dominant', role: 'tension' },
];

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
