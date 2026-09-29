// Harmonic function: the family each chord of a key belongs to (tonic, subdominant,
// dominant), a rough tension value per chord, and the path a progression takes.

import { scaleSteps } from './scales.js';

// By scale degree, the same in major and natural minor: I iii vi home, ii IV away, V vii° tension.
const FAMILIES = ['tonic', 'subdominant', 'tonic', 'subdominant', 'dominant', 'tonic', 'dominant'];

// A teaching model, not a law. iii sits above vi because it contains the leading tone;
// ii above IV because ii–V pushes harder towards the dominant.
const MAJOR_TENSION = [0, 2.5, 1.5, 2, 3, 1, 4];

/**
 * Function of the chord on a scale degree (1–7): { family, strength }. Strength is "weak"
 * for v and VII in natural minor, which have no leading tone, and "normal" otherwise.
 */
export function functionOf(degree, mode) {
  scaleSteps(mode);
  assertDegree(degree);
  const family = FAMILIES[degree - 1];
  const weak = mode === 'minor' && family === 'dominant';
  return { family, strength: weak ? 'weak' : 'normal' };
}

/** Tension of the chord on a scale degree, from 0 (I) to 4 (vii°), in half steps. Major only. */
export function tension(degree, mode) {
  scaleSteps(mode);
  assertDegree(degree);
  if (mode !== 'major') throw new Error('Tension in minor is not defined yet (lesson 07)');
  return MAJOR_TENSION[degree - 1];
}

/**
 * The functions of a progression in order, and its backwards moves: steps from a dominant
 * to a subdominant, as { from, to } positions. With `loop`, the move from the last chord
 * back to the first counts too.
 */
export function flowPath(degrees, mode, { loop = false } = {}) {
  const functions = degrees.map((degree) => functionOf(degree, mode).family);
  const moves = functions.length - (loop ? 0 : 1);
  const backwards = [];
  for (let from = 0; from < moves; from++) {
    const to = (from + 1) % functions.length;
    if (functions[from] === 'dominant' && functions[to] === 'subdominant') backwards.push({ from, to });
  }
  return { functions, backwards };
}

function assertDegree(degree) {
  if (!Number.isInteger(degree) || degree < 1 || degree > 7) throw new Error(`Degree must be 1–7, got ${degree}`);
}
