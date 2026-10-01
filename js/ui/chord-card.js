// A chord as a card: Roman numeral, name, notes and quality. The whole card is a button.
// `chord` is a diatonicChords() entry: { roman, name, notes, quality }, optionally with
// `outside: true` for a chord that uses notes from outside the key, and optionally with
// `fn` (a functionOf() result) to color the card by function instead of quality. `detail`
// is an optional extra line under the numeral, such as the degree name ("dominant"), and
// `extra` an optional line at the bottom, such as "Shares C and E with I".

import { h } from './dom.js';
import { prettyName } from './format.js';

export function createChordCard(chord, { onSelect, detail, extra }) {
  const notes = chord.notes.map(prettyName).join(' ');
  const quality = chord.outside ? `${chord.quality}, outside the key` : chord.quality;

  const element = h('button', {
    type: 'button',
    class: 'chord-card',
    'data-quality': chord.quality,
    'data-outside': chord.outside ? 'true' : null,
    'data-function': chord.fn?.family ?? null,
    'data-strength': chord.fn?.strength ?? null,
    'aria-label': `${chord.roman}${detail ? ` (${detail})` : ''}, ${prettyName(chord.name)}, ${quality}: ${notes}${extra ? `. ${extra}` : ''}`,
    onclick: () => onSelect(chord),
  },
    h('span', { class: 'chord-card__numeral' }, chord.roman),
    detail ? h('span', { class: 'chord-card__degree' }, detail) : null,
    h('span', { class: 'chord-card__name' }, prettyName(chord.name)),
    h('span', { class: 'chord-card__notes' }, notes),
    h('span', { class: 'chord-card__quality' }, quality),
    extra ? h('span', { class: 'chord-card__extra' }, extra) : null,
  );

  return {
    element,
    chord,
    setActive(on) {
      element.classList.toggle('is-active', on);
    },
  };
}
