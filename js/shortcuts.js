// Keyboard shortcuts: Space plays the section's main sound or stops what is playing,
// Escape stops. Space keeps its normal job on buttons, piano keys and form fields.
// The main sound is the element marked data-shortcut="play" (the Listen button).

const INTERACTIVE = 'button, a[href], input, select, textarea, summary, [contenteditable], [role="button"]';

/** 'play', 'stop' or null for a key press; pure so it can be tested. */
export function shortcutAction(event, { playing, canPlay }) {
  const { key, repeat, altKey, ctrlKey, metaKey, shiftKey, interactive } = event;
  if (repeat || altKey || ctrlKey || metaKey || shiftKey) return null;
  if (key === 'Escape') return playing ? 'stop' : null;
  if (key !== ' ' || interactive) return null;
  if (playing) return 'stop';
  return canPlay ? 'play' : null;
}

export function installShortcuts({ isPlaying, stopAll, root = document }) {
  document.addEventListener('keydown', (e) => {
    const target = playTarget(root);
    const action = shortcutAction(
      { key: e.key, repeat: e.repeat, altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, interactive: Boolean(e.target.closest?.(INTERACTIVE)) },
      { playing: isPlaying(), canPlay: target !== null },
    );
    if (!action) return;
    e.preventDefault();
    if (action === 'stop') stopAll();
    else target.click();
  });
}

function playTarget(root) {
  const target = root.querySelector('[data-shortcut="play"]');
  return target && !target.disabled ? target : null;
}
