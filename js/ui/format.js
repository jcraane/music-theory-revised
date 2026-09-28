// Display formatting for note and chord names. Theory code spells with # and b;
// the UI shows proper signs ("Bbm" → "B♭m").

const SIGNS = { '#': '♯', '##': '𝄪', b: '♭', bb: '𝄫' };

export function prettyName(name) {
  const match = /^([A-G])(##|#|bb|b)?(.*)$/.exec(name);
  if (!match) return name;
  const [, letter, accidental, suffix] = match;
  return letter + (accidental ? SIGNS[accidental] : '') + suffix;
}
