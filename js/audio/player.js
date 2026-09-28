// Playing notes, chords, arpeggios and sequences. Every call returns a handle with stop(),
// which fades out instead of cutting off, and `finished`, a promise that resolves once the
// sound has ended or was stopped.

import { init, createBus, fadeOutBus, outputLatency } from './engine.js';
import { instruments, DEFAULT_INSTRUMENT } from './instruments.js';
import { createScheduler, createEventQueue } from './scheduler.js';

const START_DELAY = 0.03; // seconds, so the first note isn't scheduled in the past
const LOOKAHEAD = 0.1; // seconds of audio scheduled ahead of the clock
const TICK_MS = 25;
const TAIL = 3; // seconds after the last note-off before a bus is released

const active = new Set();
let defaultInstrument = DEFAULT_INSTRUMENT;

export function setDefaultInstrument(name) {
  instrumentFor(name);
  defaultInstrument = name;
}

/**
 * Plays one MIDI note. `when` is a delay in seconds from now, `duration` is the time until
 * note-off in seconds, `velocity` is 0–1.
 */
export function playNote(midi, opts = {}) {
  return arpeggiate([midi], { ...opts, interval: 0 });
}

/** Plays several MIDI notes at once. Takes the same options as playNote. */
export function playChord(midis, opts = {}) {
  return arpeggiate(midis, { ...opts, interval: 0 });
}

/** Plays MIDI notes one after another, `interval` seconds apart, each ringing for `duration`. */
export function arpeggiate(midis, { interval = 0.25, when = 0, duration = 1, instrument, velocity = 0.8 } = {}) {
  const ctx = init();
  const bus = createBus();
  const play = instrumentFor(instrument ?? defaultInstrument);
  const start = ctx.currentTime + START_DELAY + when;

  let end = start;
  midis.forEach((midi, i) => {
    end = Math.max(end, play(ctx, bus, { midi, when: start + i * interval, duration, velocity }));
  });

  let timer;
  const { promise: finished, resolve: done } = Promise.withResolvers();
  const handle = {
    stop() {
      if (!active.delete(handle)) return;
      clearTimeout(timer);
      fadeOutBus(bus);
      done();
    },
    finished,
  };
  timer = setTimeout(() => {
    active.delete(handle);
    bus.disconnect();
    done();
  }, (end - ctx.currentTime + 0.1) * 1000);
  active.add(handle);
  return handle;
}

/**
 * Plays steps of { notes: [midi], beats = 1 } at a tempo. A step with no notes is a rest,
 * and any other fields on a step are passed back to onStep untouched.
 * onStep(step, index) fires when the step is heard, onEnd() when a non-looping sequence
 * has finished. Returns { stop(), setSteps(steps), finished }; setSteps swaps the steps
 * while playing, from the next step on.
 */
export function playSequence(steps, { bpm = 100, loop = false, onStep, onEnd, instrument, velocity = 0.8 } = {}) {
  const ctx = init();
  const bus = createBus();
  const play = instrumentFor(instrument ?? defaultInstrument);
  const queue = createEventQueue();
  const { promise: finished, resolve: done } = Promise.withResolvers();
  let timer;
  let frame;

  const scheduler = createScheduler({
    steps,
    bpm,
    loop,
    startTime: ctx.currentTime + START_DELAY,
    onSchedule(step, index, time, duration) {
      // After the tab was in the background the clock may have run past a step: skip its
      // sound rather than playing a burst of late notes.
      if (time >= ctx.currentTime) {
        for (const midi of step.notes ?? []) play(ctx, bus, { midi, when: time, duration, velocity });
      }
      queue.push(time, () => onStep?.(step, index));
    },
    onEnd(time) {
      queue.push(time, () => {
        finish();
        onEnd?.();
      });
    },
  });

  const tick = () => scheduler.advance(ctx.currentTime + LOOKAHEAD);
  const draw = () => {
    queue.flush(ctx.currentTime - outputLatency());
    frame = requestAnimationFrame(draw);
  };

  const stopTimers = () => {
    clearInterval(timer);
    cancelAnimationFrame(frame);
    queue.clear();
  };

  const finish = () => {
    active.delete(handle);
    stopTimers();
    setTimeout(() => bus.disconnect(), TAIL * 1000);
    done();
  };

  const handle = {
    stop() {
      if (!active.delete(handle)) return;
      stopTimers();
      fadeOutBus(bus);
      done();
    },
    setSteps(newSteps) {
      scheduler.setSteps(newSteps);
    },
    finished,
  };

  active.add(handle);
  tick();
  timer = setInterval(tick, TICK_MS);
  frame = requestAnimationFrame(draw);
  return handle;
}

/** Fades out everything that is playing. */
export function stopAll() {
  for (const handle of [...active]) handle.stop();
}

export function isPlaying() {
  return active.size > 0;
}

function instrumentFor(name) {
  const instrument = instruments[name];
  if (!instrument) throw new Error(`Unknown instrument: ${name}`);
  return instrument;
}
