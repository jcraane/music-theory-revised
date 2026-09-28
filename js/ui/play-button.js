// A button that starts a sound and turns into Stop while it plays.
// `play()` must return a player handle ({ stop(), finished }).

import { h } from './dom.js';

export function createPlayButton({ label = 'Listen', play, primary = true }) {
  let handle = null;

  const button = h('button', { type: 'button', class: `button play-button${primary ? ' button--primary' : ''}` });

  const show = (playing) => {
    button.replaceChildren(h('span', { class: 'play-button__icon', 'aria-hidden': 'true' }, playing ? '■' : '▶'), playing ? 'Stop' : label);
  };
  show(false);

  const start = () => {
    const current = play();
    handle = current;
    show(true);
    current.finished.then(() => {
      if (handle !== current) return;
      handle = null;
      show(false);
    });
    return current;
  };

  button.addEventListener('click', () => {
    if (handle) handle.stop();
    else start();
  });

  return {
    element: button,
    /** Starts playing as if the button was pressed; returns the handle. */
    start,
    get playing() {
      return handle !== null;
    },
    /** The handle of what is playing, or null. */
    get handle() {
      return handle;
    },
  };
}
