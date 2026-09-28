// Pick a key from a row of radio buttons, so arrow keys move between keys for free.

import { h } from './dom.js';
import { prettyName } from './format.js';

let groups = 0;

export function createKeySelector({ tonics, value, onChange, label = 'Key' }) {
  const name = `key-selector-${++groups}`;

  const options = tonics.map((tonic) =>
    h('label', { class: 'key-selector__option' },
      h('input', { type: 'radio', name, value: tonic, checked: tonic === value, class: 'key-selector__input' }),
      h('span', { class: 'key-selector__label' }, prettyName(tonic))),
  );

  const element = h('fieldset', { class: 'key-selector' }, h('legend', { class: 'field__label' }, label), options);
  element.addEventListener('change', (e) => onChange(e.target.value));

  return { element };
}
