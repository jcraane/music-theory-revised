// Interactive piano keyboard. Keys are addressed by MIDI number so voicings and inversions
// show on the right keys; callers pass spelled names ({ midi, name }) so labels follow the key.

import { parseNote, pitchClass } from '../theory/notes.js';
import { playNote } from '../audio/player.js';
import { prettyName } from './format.js';

export const ROLES = ['root', 'third', 'fifth', 'scale', 'outside-key', 'skipped'];

const ROLE_DESCRIPTIONS = {
  root: 'root',
  third: 'third',
  fifth: 'fifth',
  scale: 'in the scale',
  'outside-key': 'outside the key',
  skipped: 'skipped',
};
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_PITCHES = new Set([1, 3, 6, 8, 10]);
const BLACK_KEY_WIDTH = 0.6; // relative to a white key
const KEY_ASPECT = 3.6; // white key height / width
const LABEL_MODES = ['none', 'highlighted', 'all'];

export function isBlack(midi) {
  return BLACK_PITCHES.has(((midi % 12) + 12) % 12);
}

/** Name used when the caller gave none: naturals, and sharps on black keys. */
export function defaultNoteName(midi) {
  return SHARP_NAMES[((midi % 12) + 12) % 12];
}

export function octaveOf(midi) {
  return Math.floor(midi / 12) - 1;
}

/** "Eb" → "E flat", for screen readers. */
export function spokenName(name) {
  const { letter, offset } = parseNote(name);
  const accidental = { '-2': ' double flat', '-1': ' flat', 0: '', 1: ' sharp', 2: ' double sharp' }[offset];
  return letter + accidental;
}

/**
 * Keys from a white key `from` up `octaves` octaves, with left and width as percentages
 * of the keyboard width. A range that would end on a black key gets one more white key.
 */
export function keyLayout(from, octaves) {
  if (isBlack(from)) throw new Error(`The keyboard must start on a white key, got ${from}`);
  if (!Number.isInteger(octaves) || octaves < 1) throw new Error(`Invalid number of octaves: ${octaves}`);

  let to = from + 12 * octaves - 1;
  if (isBlack(to)) to += 1;

  const midis = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const whiteWidth = 100 / midis.filter((m) => !isBlack(m)).length;
  const blackWidth = whiteWidth * BLACK_KEY_WIDTH;
  let whites = 0;

  return midis.map((midi) => {
    if (isBlack(midi)) {
      return { midi, black: true, left: whites * whiteWidth - blackWidth / 2, width: blackWidth };
    }
    const key = { midi, black: false, left: whites * whiteWidth, width: whiteWidth };
    whites += 1;
    return key;
  });
}

/**
 * Renders a keyboard into `container`.
 * Options: from (lowest MIDI note, white key), octaves, labels ('none' | 'highlighted' | 'all'),
 * sound (play keys when pressed), label (accessible name).
 * Pressing a key dispatches a bubbling "noteplay" event with detail { midi, name }.
 */
export function createPiano(container, { from = 60, octaves = 2, labels = 'highlighted', sound = true, label = 'Piano' } = {}) {
  assertLabelMode(labels);
  const layout = keyLayout(from, octaves);
  const keys = new Map();
  let active = new Set();
  let focusedMidi = from;

  const root = el('div', 'piano');
  const above = el('div', 'piano__lane piano__lane--above');
  const below = el('div', 'piano__lane piano__lane--below');
  const board = el('div', 'piano__keys');
  above.setAttribute('aria-hidden', 'true');
  below.setAttribute('aria-hidden', 'true');
  board.setAttribute('role', 'group');
  board.setAttribute('aria-label', label);
  board.style.aspectRatio = `${layout.filter((k) => !k.black).length} / ${KEY_ASPECT}`;

  for (const { midi, black, left, width } of layout) {
    const button = el('button', `piano__key piano__key--${black ? 'black' : 'white'}`);
    button.type = 'button';
    button.dataset.midi = midi;
    button.style.left = `${left}%`;
    button.style.width = `${width}%`;
    button.tabIndex = midi === focusedMidi ? 0 : -1;
    const text = el('span', 'piano__label');
    button.append(text);
    board.append(button);
    const key = { midi, black, left, width, button, text, role: null, name: null };
    keys.set(midi, key);
    render(key);
  }

  root.append(above, board, below);
  container.append(root);

  const onPointerDown = (e) => {
    const key = keyFromEvent(e);
    if (!key) return;
    press(key);
    const release = () => key.button.classList.remove('is-pressed');
    window.addEventListener('pointerup', release, { once: true });
    window.addEventListener('pointercancel', release, { once: true });
  };

  const onKeyDown = (e) => {
    const key = keyFromEvent(e);
    if (!key) return;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 };
    if (e.key in moves) {
      e.preventDefault();
      focusKey(key.midi + moves[e.key]);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      focusKey(e.key === 'Home' ? layout[0].midi : layout.at(-1).midi);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!e.repeat) press(key);
    }
  };

  const onKeyUp = (e) => {
    const key = keyFromEvent(e);
    if (key && (e.key === 'Enter' || e.key === ' ')) key.button.classList.remove('is-pressed');
  };

  board.addEventListener('pointerdown', onPointerDown);
  board.addEventListener('keydown', onKeyDown);
  board.addEventListener('keyup', onKeyUp);

  function keyFromEvent(e) {
    const button = e.target.closest?.('.piano__key');
    return button ? keys.get(Number(button.dataset.midi)) : null;
  }

  function press(key) {
    if (sound) playNote(key.midi);
    key.button.classList.add('is-pressed');
    setFocusable(key.midi);
    const name = key.name ?? defaultNoteName(key.midi);
    root.dispatchEvent(new CustomEvent('noteplay', { bubbles: true, detail: { midi: key.midi, name } }));
  }

  function focusKey(midi) {
    const key = keys.get(midi);
    if (!key) return;
    setFocusable(midi);
    key.button.focus();
  }

  function setFocusable(midi) {
    keys.get(focusedMidi).button.tabIndex = -1;
    focusedMidi = midi;
    keys.get(midi).button.tabIndex = 0;
  }

  function render(key) {
    const name = key.name ?? defaultNoteName(key.midi);
    const showLabel = labels === 'all' ? key.name !== null || !key.black : labels === 'highlighted' && key.role !== null;
    key.text.textContent = showLabel ? prettyName(name) : '';

    if (key.role) key.button.dataset.role = key.role;
    else delete key.button.dataset.role;

    // The octave belongs to the letter: B#3 sits on the key of C4.
    const octave = octaveOf(key.midi - parseNote(name).offset);
    const description = key.role ? `, ${ROLE_DESCRIPTIONS[key.role]}` : '';
    key.button.setAttribute('aria-label', `${spokenName(name)} ${octave}${description}`);
  }

  function annotationLane(where) {
    if (where !== 'above' && where !== 'below') throw new Error(`Unknown annotation lane: ${where}`);
    return where === 'above' ? above : below;
  }

  return {
    element: root,

    /** Gives notes (MIDI numbers or { midi, name }) a role. Notes outside the range are ignored. */
    highlight(notes, role) {
      if (!ROLES.includes(role)) throw new Error(`Unknown role: ${role}`);
      for (const note of notes) {
        const { midi, name } = normalize(note);
        const key = keys.get(midi);
        if (!key) continue;
        key.role = role;
        if (name) key.name = name;
        render(key);
      }
    },

    /** Removes role and name from notes. */
    unhighlight(notes) {
      for (const note of notes) {
        const key = keys.get(normalize(note).midi);
        if (!key) continue;
        key.role = null;
        key.name = null;
        render(key);
      }
    },

    /** Removes every highlight, or only those with the given role. */
    clear(role) {
      for (const key of keys.values()) {
        if (role && key.role !== role) continue;
        key.role = null;
        key.name = null;
        render(key);
      }
    },

    /** Marks the notes that are sounding now; replaces the previous set. */
    setActive(notes) {
      const next = new Set(notes.map((n) => normalize(n).midi));
      for (const midi of active) if (!next.has(midi)) keys.get(midi)?.button.classList.remove('is-active');
      for (const midi of next) keys.get(midi)?.button.classList.add('is-active');
      active = next;
    },

    setLabels(mode) {
      assertLabelMode(mode);
      labels = mode;
      keys.forEach(render);
    },

    /** Draws a bracket from one key to another with a short text, e.g. "W" or "major 3rd". */
    annotate(fromMidi, toMidi, text, { lane = 'above' } = {}) {
      const a = keys.get(fromMidi);
      const b = keys.get(toMidi);
      if (!a || !b) return;
      const [left, right] = [center(a), center(b)].sort((x, y) => x - y);
      const note = el('span', 'piano__annotation');
      note.style.left = `${left}%`;
      note.style.width = `${right - left}%`;
      note.textContent = text;
      annotationLane(lane).append(note);
    },

    clearAnnotations(lane) {
      (lane ? [annotationLane(lane)] : [above, below]).forEach((l) => l.replaceChildren());
    },

    destroy() {
      board.removeEventListener('pointerdown', onPointerDown);
      board.removeEventListener('keydown', onKeyDown);
      board.removeEventListener('keyup', onKeyUp);
      root.remove();
    },
  };
}

function normalize(note) {
  if (typeof note === 'number') return { midi: note, name: null };
  const name = note.name ?? null;
  if (name !== null && pitchClass(name) !== ((note.midi % 12) + 12) % 12) {
    throw new Error(`Note name ${name} does not match MIDI note ${note.midi}`);
  }
  return { midi: note.midi, name };
}

function center(key) {
  return key.left + key.width / 2;
}

function assertLabelMode(mode) {
  if (!LABEL_MODES.includes(mode)) throw new Error(`Unknown label mode: ${mode}`);
}

function el(tag, className) {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}
