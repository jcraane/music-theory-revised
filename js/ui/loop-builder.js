// A four-chord loop built by picking chords. The section owns the sound: `play(degrees)`
// must return a player handle for the looping sequence. `onChange(degrees)` runs whenever
// a chord is added or the loop is cleared.

import { h } from './dom.js';
import { prettyName } from './format.js';
import { createPlayButton } from './play-button.js';

export function createLoopBuilder({ length = 4, play, onChange }) {
  let degrees = [];
  let chords = [];

  const slots = Array.from({ length }, () => h('li', { class: 'loop-slot' }));
  const playButton = createPlayButton({ label: 'Play loop', primary: false, play: () => play([...degrees]) });
  const clearButton = h('button', {
    type: 'button',
    class: 'button',
    onclick: () => {
      playButton.handle?.stop();
      degrees = [];
      render();
      onChange?.([]);
    },
  }, 'Clear');

  function render() {
    slots.forEach((el, i) => {
      const chord = degrees[i] ? chords[degrees[i] - 1] : null;
      el.replaceChildren(...(chord
        ? [h('span', { class: 'loop-slot__numeral' }, chord.roman), h('span', { class: 'loop-slot__name' }, prettyName(chord.name))]
        : [h('span', { class: 'loop-slot__empty' }, String(i + 1))]));
      el.dataset.quality = chord?.quality ?? '';
      el.dataset.function = chord?.fn?.family ?? '';
      el.dataset.strength = chord?.fn?.strength ?? '';
      el.setAttribute('aria-label', chord ? `Chord ${i + 1}: ${chord.roman}, ${prettyName(chord.name)}` : `Chord ${i + 1}: empty`);
    });
    playButton.element.disabled = degrees.length < length;
    clearButton.disabled = degrees.length === 0;
  }

  render();

  return {
    element: h('div', { class: 'loop-builder' },
      h('ol', { class: 'loop-slots' }, slots),
      h('div', { class: 'button-row' }, playButton.element, clearButton)),

    /**
     * Adds a chord by scale degree. Once the loop is full it starts playing and this returns
     * true; picking again after that starts a new loop.
     */
    add(degree) {
      if (degrees.length === length) degrees = [];
      degrees.push(degree);
      render();
      onChange?.([...degrees]);
      if (degrees.length < length) return false;
      playButton.start();
      return true;
    },

    /**
     * The chords the degrees refer to (a key's diatonicChords, optionally with `fn` to color
     * slots by function); renumbers the slots.
     */
    setChords(list) {
      chords = list;
      render();
    },

    setActive(slot) {
      slots.forEach((el, i) => el.classList.toggle('is-active', i === slot));
    },

    get degrees() {
      return [...degrees];
    },

    /** The handle of the loop that is playing, or null. */
    get handle() {
      return playButton.handle;
    },
  };
}
