// A small legend for the piano's highlight colors.

import { h } from './dom.js';

const LABELS = {
  root: 'Root',
  third: 'Third',
  fifth: 'Fifth',
  scale: 'In the scale',
  'outside-key': 'Outside the key',
  skipped: 'Skipped',
};

export function roleLegend(roles) {
  return h('ul', { class: 'role-legend', 'aria-label': 'Colors on the piano' },
    roles.map((role) => h('li', {}, h('span', { class: 'role-legend__swatch', 'data-role': role, 'aria-hidden': 'true' }), LABELS[role])));
}
