// Pick a key from a row of choices, shown with sharp and flat signs.

import { prettyName } from './format.js';
import { createChoiceGroup } from './choice-group.js';

export function createKeySelector({ tonics, value, onChange, label = 'Key' }) {
  return createChoiceGroup({
    options: tonics.map((tonic) => ({ value: tonic, label: prettyName(tonic) })),
    value,
    onChange,
    label,
  });
}
