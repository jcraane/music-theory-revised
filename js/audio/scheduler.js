// Timing logic for sequences, kept free of Web Audio so it can be unit-tested.

export function beatsToSeconds(beats, bpm) {
  return (beats * 60) / bpm;
}

/**
 * Lookahead scheduler over a list of steps ({ beats = 1, ... }).
 * advance(until) calls onSchedule(step, index, time, duration) for every step that starts
 * before `until`, and onEnd(time) once when a non-looping sequence runs out.
 * setSteps() swaps the steps from the next unscheduled step on, keeping the position.
 */
export function createScheduler({ steps, bpm, loop = false, startTime, onSchedule, onEnd }) {
  if (!Number.isFinite(bpm) || bpm <= 0) throw new Error(`Invalid tempo: ${bpm}`);
  assertSteps(steps);

  let index = 0;
  let nextTime = startTime;
  let done = false;

  return {
    advance(until) {
      while (!done && nextTime < until) {
        if (index >= steps.length) {
          if (loop && steps.length > 0) {
            index = 0;
          } else {
            done = true;
            onEnd?.(nextTime);
            break;
          }
        }
        const step = steps[index];
        const duration = beatsToSeconds(step.beats ?? 1, bpm);
        onSchedule(step, index, nextTime, duration);
        nextTime += duration;
        index += 1;
      }
    },
    setSteps(newSteps) {
      assertSteps(newSteps);
      steps = newSteps;
    },
    get done() {
      return done;
    },
  };
}

/** Time-stamped callbacks, fired in time order once flush() reaches their time. */
export function createEventQueue() {
  let events = [];

  return {
    push(time, fn) {
      // Insert after any events at the same time, so equal times keep insertion order.
      const at = events.findIndex((e) => e.time > time);
      events.splice(at === -1 ? events.length : at, 0, { time, fn });
    },
    flush(now) {
      while (events.length > 0 && events[0].time <= now) {
        events.shift().fn();
      }
    },
    clear() {
      events = [];
    },
    get size() {
      return events.length;
    },
  };
}

function assertSteps(steps) {
  for (const step of steps) {
    const beats = step.beats ?? 1;
    if (!Number.isFinite(beats) || beats <= 0) throw new Error(`Invalid step length: ${beats} beats`);
  }
}
