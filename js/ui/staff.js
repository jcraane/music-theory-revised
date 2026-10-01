// A treble staff showing chords as whole notes, one per bar, with a label under each bar
// (e.g. Roman numerals). Notes are { midi, name }, so the spelling decides the line or space
// and the accidental. Noteheads are colored root, third and fifth from the bottom up, unless
// a note has its own `role` ("root", "third", "fifth" or "plain"). Rendered as SVG with glyphs from Bravura (see staff-glyphs.js).

import { LETTERS, parseNote } from '../theory/notes.js';
import { GLYPHS } from './staff-glyphs.js';

const ACCIDENTAL_GLYPH = { '-2': 'accidentalDoubleFlat', '-1': 'accidentalFlat', 1: 'accidentalSharp', 2: 'accidentalDoubleSharp' };
const ROLES = ['root', 'third', 'fifth'];

// Geometry in SVG units: a staff space is 10, one step (line to space) is 5.
const SPACE = 10;
const STEP = SPACE / 2;
const FONT = SPACE / 250; // glyph units per staff space
const CLEF_WIDTH = GLYPHS.gClef.advance * FONT;
const NOTE_WIDTH = GLYPHS.noteheadWhole.advance * FONT;
const ACCIDENTAL_COLUMN = 12; // widest accidental (double flat is 16.5, rare) plus a little air
const ACCIDENTAL_GAP = 3; // between the nearest accidental and the note
const BAR_PADDING = 10;
const MIN_BAR_WIDTH = 44;
const PIXELS_PER_UNIT = 1.6; // shown size on wide screens
const MIN_PIXELS_PER_UNIT = 1.15; // below this, bars move to a new system instead of shrinking
const LEFT = 4;
const HEADER_WIDTH = LEFT + CLEF_WIDTH + 8 + 4; // clef before the bars, margin after
const MIN_GAP = 6; // accidentals closer than this many steps must not share a column

/** Steps above the bottom line (E4) of the treble staff; the letter decides, not the pitch. */
export function staffStep({ midi, name }) {
  const { letter, offset } = parseNote(name);
  const octave = Math.floor((midi - offset) / 12) - 1;
  return octave * 7 + LETTERS.indexOf(letter) - (4 * 7 + 2);
}

/** Steps that need a ledger line for a note on `step`. */
export function ledgerSteps(step) {
  const lines = [];
  for (let s = -2; s >= step; s -= 2) lines.push(s);
  for (let s = 10; s <= step; s += 2) lines.push(s);
  return lines;
}

/**
 * Column for each note's accidental (0 is nearest the notes), or null without one.
 * Placed top note first, then the bottom one, then inwards, each in the nearest column
 * where it doesn't collide with an accidental less than a seventh away.
 */
export function accidentalColumns(notes) {
  const withSign = notes.map((n, i) => ({ ...n, i })).filter((n) => n.accidental !== 0).sort((a, b) => b.step - a.step);
  const order = [];
  for (let top = 0, bottom = withSign.length - 1; top <= bottom; top++, bottom--) {
    order.push(withSign[top]);
    if (bottom !== top) order.push(withSign[bottom]);
  }

  const columns = notes.map(() => null);
  const placed = [];
  for (const note of order) {
    let column = 0;
    while (placed.some((p) => p.column === column && Math.abs(p.step - note.step) < MIN_GAP)) column += 1;
    placed.push({ step: note.step, column });
    columns[note.i] = column;
  }
  return columns;
}

/**
 * Splits bars into systems (lines of music) that fit `available` units, each system also
 * needing `header` units for its clef. Uses as few systems as possible, with the bars
 * spread evenly and fuller systems first. Returns bar indices per system.
 */
export function splitSystems(barWidths, available, header) {
  const room = available - header;
  const total = barWidths.reduce((sum, w) => sum + w, 0);
  let count = Math.min(barWidths.length, Math.max(1, Math.ceil(total / room)));

  for (;;) {
    const systems = [];
    let next = 0;
    for (let i = 0; i < count; i++) {
      const size = Math.ceil((barWidths.length - next) / (count - i));
      systems.push(Array.from({ length: size }, (_, j) => next + j));
      next += size;
    }
    const fits = systems.every((bars) => bars.reduce((sum, b) => sum + barWidths[b], 0) <= room);
    if (fits || count === barWidths.length) return systems;
    count += 1;
  }
}

/**
 * options: onSelect(index) when a bar is clicked.
 * render({ chords: [{ notes, label }], keyLabel, label }) draws the bars; notes are colored
 * root, third and fifth in order, and `label` describes the staff for screen readers.
 * When the bars don't fit the width, they continue on a new system. The same chords are
 * reachable by keyboard elsewhere (chord cards), so bars respond to the pointer only.
 */
export function createStaff(container, { onSelect } = {}) {
  const element = document.createElement('div');
  element.className = 'staff';
  element.setAttribute('role', 'img');
  container.append(element);

  let current = null;
  let layoutKey = '';
  let bars = [];
  let active = null;

  function layout() {
    if (!current) return;
    const available = (element.clientWidth || 640) / MIN_PIXELS_PER_UNIT;
    const systems = splitSystems(current.bars.map((b) => b.width), available, HEADER_WIDTH);
    const key = JSON.stringify(systems);
    if (key === layoutKey) return;
    layoutKey = key;

    const svgs = systems.map((indices, s) => drawSystem(current, indices, { first: s === 0, last: s === systems.length - 1 }));
    // One scale for all systems, so notes are the same size on every line.
    const widest = Math.max(...svgs.map((svg) => Number(svg.dataset.width)));
    const scale = Math.min(PIXELS_PER_UNIT, (element.clientWidth || widest * PIXELS_PER_UNIT) / widest);
    svgs.forEach((svg) => {
      svg.style.width = `${Number(svg.dataset.width) * scale}px`;
    });
    element.replaceChildren(...svgs);
    bars = [...element.querySelectorAll('.staff__bar')];
    bars.forEach((bar) => bar.addEventListener('click', () => onSelect?.(Number(bar.dataset.index))));
    setActive(active);
  }

  function setActive(index) {
    active = index;
    bars.forEach((bar) => bar.classList.toggle('is-active', Number(bar.dataset.index) === index));
  }

  new ResizeObserver(layout).observe(element);

  return {
    element,

    render({ chords, keyLabel = '', label = 'Staff' }) {
      element.setAttribute('aria-label', label);
      current = measure(chords, keyLabel);
      layoutKey = '';
      layout();
    },

    setActive,
  };
}

// Positions, accidental columns and bar widths for all chords, and one vertical range
// shared by every system so the lines stay aligned.
function measure(chords, keyLabel) {
  const bars = chords.map((chord) => {
    const notes = chord.notes.map((note, j) => ({ step: staffStep(note), accidental: parseNote(note.name).offset, role: note.role ?? ROLES[j] ?? 'root' }));
    const columns = accidentalColumns(notes);
    const used = Math.max(-1, ...columns.filter((c) => c !== null));
    // Each bar is as wide as its accidentals need, so they never reach into the previous bar.
    const accidentalWidth = used < 0 ? 0 : (used + 1) * ACCIDENTAL_COLUMN + ACCIDENTAL_GAP;
    const width = Math.max(MIN_BAR_WIDTH, BAR_PADDING + accidentalWidth + NOTE_WIDTH + BAR_PADDING);
    return { label: chord.label ?? '', notes, columns, accidentalWidth, width };
  });
  const steps = bars.flatMap((b) => b.notes.map((n) => n.step));
  // Room for the clef (about -3.5 to 11 steps) and every note.
  const top = Math.max(11, ...steps) + 2;
  const bottom = Math.min(-4, ...steps) - 1;
  return { bars, keyLabel, top, bottom };
}

function drawSystem({ bars: allBars, keyLabel, top, bottom }, indices, { first, last }) {
  const y = (step) => (top - step) * STEP;
  const labelY = y(bottom) + 10;

  const barsX = LEFT + CLEF_WIDTH + 8;
  const starts = [];
  let x = barsX;
  for (const i of indices) {
    starts.push(x);
    x += allBars[i].width;
  }
  const width = x + 4;
  const height = labelY + 6;

  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, class: 'staff__svg', 'aria-hidden': 'true', 'data-width': width });

  // Bar backgrounds first, so notes draw on top; they also catch clicks.
  indices.forEach((i, k) => {
    svg.append(el('rect', { class: 'staff__bar', 'data-index': i, x: starts[k], y: 0, width: allBars[i].width, height }));
  });

  for (let step = 0; step <= 8; step += 2) {
    svg.append(el('line', { class: 'staff__line', x1: LEFT, x2: width - 4, y1: y(step), y2: y(step) }));
  }

  svg.append(glyph('gClef', LEFT + 2, y(2)));
  if (keyLabel && first) svg.append(text(keyLabel, LEFT + CLEF_WIDTH / 2, labelY, 'staff__label'));

  indices.forEach((i, k) => {
    const bar = allBars[i];
    const barX = starts[k];
    // Center the note and its accidentals together in the bar.
    const noteX = barX + (bar.width - bar.accidentalWidth - NOTE_WIDTH) / 2 + bar.accidentalWidth;

    bar.notes.forEach(({ step, accidental, role }, j) => {
      for (const ledger of ledgerSteps(step)) {
        svg.append(el('line', { class: 'staff__line', x1: noteX - 3, x2: noteX + NOTE_WIDTH + 3, y1: y(ledger), y2: y(ledger) }));
      }
      const column = bar.columns[j];
      if (column !== null) {
        const glyphWidth = GLYPHS[ACCIDENTAL_GLYPH[accidental]].advance * FONT;
        const right = noteX - ACCIDENTAL_GAP - column * ACCIDENTAL_COLUMN;
        svg.append(glyph(ACCIDENTAL_GLYPH[accidental], right - glyphWidth, y(step), 'staff__accidental'));
      }
      svg.append(glyph('noteheadWhole', noteX, y(step), `staff__note staff__note--${role}`));
    });

    svg.append(text(bar.label, noteX + NOTE_WIDTH / 2, labelY, 'staff__label'));
    const lineX = barX + bar.width;
    const final = last && k === indices.length - 1;
    svg.append(el('line', { class: 'staff__barline', x1: lineX - (final ? 4 : 0), x2: lineX - (final ? 4 : 0), y1: y(8), y2: y(0) }));
    if (final) svg.append(el('rect', { class: 'staff__final', x: lineX - 2, y: y(8), width: 2.5, height: y(0) - y(8) }));
  });

  return svg;
}
function glyph(name, x, y, className = 'staff__glyph') {
  return el('path', { d: GLYPHS[name].d, transform: `translate(${x} ${y}) scale(${FONT} ${-FONT})`, class: className });
}

function text(content, x, y, className) {
  const node = el('text', { x, y, class: className, 'text-anchor': 'middle' });
  node.textContent = content;
  return node;
}

function el(tag, attrs) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}
