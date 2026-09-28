// A row of radio buttons styled as pills; arrow keys move between them for free.
// options: [{ value, label }].

import { h } from './dom.js';

let groups = 0;

export function createChoiceGroup({ options, value, onChange, label }) {
  const name = `choice-group-${++groups}`;
  const labels = new Map();

  const items = options.map((option) => {
    const text = h('span', { class: 'choice-group__label' }, option.label);
    labels.set(option.value, text);
    return h('label', { class: 'choice-group__option' },
      h('input', { type: 'radio', name, value: option.value, checked: option.value === value, class: 'choice-group__input' }),
      text);
  });

  const element = h('fieldset', { class: 'choice-group' }, h('legend', { class: 'field__label' }, label), items);
  element.addEventListener('change', (e) => onChange(e.target.value));

  return {
    element,
    /** Updates the visible text of an option. */
    setLabel(optionValue, text) {
      const el = labels.get(optionValue);
      if (el) el.textContent = text;
    },
  };
}
