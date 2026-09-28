import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { beatsToSeconds, createScheduler, createEventQueue } from '../js/audio/scheduler.js';
import { midiToFrequency } from '../js/audio/instruments.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≉ ${expected}`);

describe('midiToFrequency', () => {
  test('A4 is 440 Hz and octaves double', () => {
    close(midiToFrequency(69), 440);
    close(midiToFrequency(81), 880);
    close(midiToFrequency(57), 220);
  });

  test('middle C', () => {
    assert.ok(Math.abs(midiToFrequency(60) - 261.6256) < 1e-4);
  });
});

describe('beatsToSeconds', () => {
  test('converts beats at a tempo', () => {
    close(beatsToSeconds(1, 60), 1);
    close(beatsToSeconds(1, 100), 0.6);
    close(beatsToSeconds(2, 120), 1);
  });
});

// Runs a scheduler and records what it schedules.
function record({ steps, bpm = 60, loop = false, startTime = 10 }) {
  const scheduled = [];
  const ends = [];
  const scheduler = createScheduler({
    steps,
    bpm,
    loop,
    startTime,
    onSchedule: (step, index, time, duration) => scheduled.push({ step, index, time, duration }),
    onEnd: (time) => ends.push(time),
  });
  return { scheduler, scheduled, ends };
}

describe('createScheduler', () => {
  const steps = [{ notes: [60] }, { notes: [64], beats: 2 }, { notes: [67] }];

  test('schedules only the steps that start before the horizon', () => {
    const { scheduler, scheduled } = record({ steps });
    scheduler.advance(10.5);
    assert.deepEqual(scheduled.map((s) => s.index), [0]);
    scheduler.advance(11.5);
    assert.deepEqual(scheduled.map((s) => s.index), [0, 1]);
  });

  test('uses the beats of each step for timing', () => {
    const { scheduler, scheduled } = record({ steps, bpm: 120 });
    scheduler.advance(100);
    assert.deepEqual(scheduled.map((s) => s.time), [10, 10.5, 11.5]);
    assert.deepEqual(scheduled.map((s) => s.duration), [0.5, 1, 0.5]);
  });

  test('passes the step object through', () => {
    const { scheduler, scheduled } = record({ steps });
    scheduler.advance(100);
    assert.equal(scheduled[1].step, steps[1]);
  });

  test('ends once after the last step', () => {
    const { scheduler, ends } = record({ steps });
    scheduler.advance(100);
    scheduler.advance(200);
    assert.deepEqual(ends, [14]);
    assert.equal(scheduler.done, true);
  });

  test('loops back to the first step', () => {
    const { scheduler, scheduled, ends } = record({ steps, loop: true });
    scheduler.advance(18);
    assert.deepEqual(scheduled.map((s) => s.index), [0, 1, 2, 0, 1, 2]);
    assert.deepEqual(scheduled.map((s) => s.time), [10, 11, 13, 14, 15, 17]);
    assert.deepEqual(ends, []);
    assert.equal(scheduler.done, false);
  });

  test('an empty sequence ends straight away, even when looping', () => {
    const { scheduler, scheduled, ends } = record({ steps: [], loop: true });
    scheduler.advance(100);
    assert.deepEqual(scheduled, []);
    assert.deepEqual(ends, [10]);
  });

  test('setSteps applies from the next unscheduled step', () => {
    const { scheduler, scheduled } = record({ steps, loop: true });
    scheduler.advance(10.5);
    const swapped = [{ notes: [48] }, { notes: [53] }, { notes: [55] }];
    scheduler.setSteps(swapped);
    scheduler.advance(12.5);
    assert.deepEqual(scheduled.map((s) => s.step), [steps[0], swapped[1], swapped[2]]);
  });

  test('setSteps with fewer steps wraps when looping', () => {
    const { scheduler, scheduled } = record({ steps, loop: true });
    scheduler.advance(12.5); // indexes 0, 1 scheduled; next is 2
    scheduler.setSteps([{ notes: [50] }, { notes: [52] }]);
    scheduler.advance(13.5);
    assert.deepEqual(scheduled.map((s) => s.step.notes[0]), [60, 64, 50]);
  });

  test('setSteps with fewer steps ends when not looping', () => {
    const { scheduler, ends } = record({ steps });
    scheduler.advance(12.5);
    scheduler.setSteps([{ notes: [50] }]);
    scheduler.advance(100);
    assert.deepEqual(ends, [13]);
  });

  test('rejects an invalid tempo', () => {
    assert.throws(() => createScheduler({ steps, bpm: 0, startTime: 0, onSchedule() {} }));
  });
});

describe('createEventQueue', () => {
  test('fires events that are due, in time order', () => {
    const queue = createEventQueue();
    const fired = [];
    queue.push(2, () => fired.push('b'));
    queue.push(1, () => fired.push('a'));
    queue.push(3, () => fired.push('c'));

    queue.flush(0.5);
    assert.deepEqual(fired, []);
    queue.flush(2);
    assert.deepEqual(fired, ['a', 'b']);
    queue.flush(10);
    assert.deepEqual(fired, ['a', 'b', 'c']);
    assert.equal(queue.size, 0);
  });

  test('keeps insertion order for events at the same time', () => {
    const queue = createEventQueue();
    const fired = [];
    queue.push(1, () => fired.push('first'));
    queue.push(1, () => fired.push('second'));
    queue.flush(1);
    assert.deepEqual(fired, ['first', 'second']);
  });

  test('clear drops pending events', () => {
    const queue = createEventQueue();
    let fired = false;
    queue.push(1, () => { fired = true; });
    queue.clear();
    queue.flush(10);
    assert.equal(fired, false);
  });
});
