// Display formatting for note and chord names and chord functions. Theory code spells
// with # and b; the UI shows proper signs ("Bbm" → "B♭m").

const SIGNS = { '#': '♯', '##': '𝄪', b: '♭', bb: '𝄫' };

export function prettyName(name) {
  const match = /^([A-G])(##|#|bb|b)?(.*)$/.exec(name);
  if (!match) return name;
  const [, letter, accidental, suffix] = match;
  return letter + (accidental ? SIGNS[accidental] : '') + suffix;
}

/** Text for a chord function from functionOf(): "tonic", "weak dominant". */
export function functionLabel({ family, strength }) {
  return strength === 'weak' ? `weak ${family}` : family;
}
