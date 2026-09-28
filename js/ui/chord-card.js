// A chord as a card: Roman numeral, name, notes and quality. The whole card is a button.
// `chord` is a diatonicChords() entry: { roman, name, notes, quality }.

import { h } from './dom.js';
import { prettyName } from './format.js';

export function createChordCard(chord, { onSelect }) {
  const notes = chord.notes.map(prettyName).join(' ');

  const element = h('button', {
    type: 'button',
    class: 'chord-card',
    'data-quality': chord.quality,
    'aria-label': `${chord.roman}, ${prettyName(chord.name)}, ${chord.quality}: ${notes}`,
    onclick: () => onSelect(chord),
  },
    h('span', { class: 'chord-card__numeral' }, chord.roman),
    h('span', { class: 'chord-card__name' }, prettyName(chord.name)),
    h('span', { class: 'chord-card__notes' }, notes),
    h('span', { class: 'chord-card__quality' }, chord.quality),
  );

  return {
    element,
    chord,
    setActive(on) {
      element.classList.toggle('is-active', on);
    },
  };
}
