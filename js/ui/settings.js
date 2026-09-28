// Settings panel in the header: instrument, volume, theme and note names.

import { h } from './dom.js';

const OPTIONS = {
  instrument: [['keys', 'Keys'], ['pad', 'Pad']],
  theme: [['system', 'Match system'], ['light', 'Light'], ['dark', 'Dark']],
  noteNames: [['highlighted', 'On highlighted keys'], ['all', 'On all keys'], ['none', 'Off']],
};

export function renderSettings(container, store) {
  const settings = store.settings;

  const select = (key, label) => h('label', { class: 'field' },
    h('span', { class: 'field__label' }, label),
    h('select', { onchange: (e) => store.updateSettings({ [key]: e.target.value }) },
      OPTIONS[key].map(([value, text]) => h('option', { value, selected: settings[key] === value }, text))),
  );

  const volume = h('input', {
    type: 'range',
    min: '0',
    max: '1',
    step: '0.05',
    value: String(settings.volume),
    oninput: (e) => store.updateSettings({ volume: Number(e.target.value) }),
  });

  const panel = h('details', { class: 'settings' },
    h('summary', { class: 'button' }, 'Settings'),
    h('div', { class: 'settings__panel' },
      select('instrument', 'Instrument'),
      h('label', { class: 'field' }, h('span', { class: 'field__label' }, 'Volume'), volume),
      select('theme', 'Theme'),
      select('noteNames', 'Note names'),
      h('p', { class: 'hint settings__keys' }, 'Space plays or stops the example. Esc stops all sound.'),
    ),
  );

  // Close on Escape or when clicking outside the panel.
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.open) {
      panel.open = false;
      panel.querySelector('summary').focus();
    }
  });
  document.addEventListener('pointerdown', (e) => {
    if (panel.open && !panel.contains(e.target)) panel.open = false;
  });

  container.append(panel);
}
