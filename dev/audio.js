import { unlockOnGesture, setVolume, isReady } from '../js/audio/engine.js';
import { playNote, playChord, arpeggiate, playSequence, stopAll, setDefaultInstrument } from '../js/audio/player.js';
import { toMidi, toMidiAscending } from '../js/theory/notes.js';
import { spellScale } from '../js/theory/scales.js';
import { diatonicChords, buildTriad, chordName } from '../js/theory/chords.js';

const $ = (id) => document.getElementById(id);
const C_MAJOR = toMidiAscending(['C', 'E', 'G'], 4);

unlockOnGesture();
document.addEventListener('pointerup', () => {
  $('status').textContent = isReady() ? 'Audio is running.' : 'Audio is starting…';
});

$('instrument').addEventListener('change', (e) => setDefaultInstrument(e.target.value));
$('volume').addEventListener('input', (e) => setVolume(Number(e.target.value)));

$('note').addEventListener('click', () => playNote(toMidi('C', 4)));
$('chord').addEventListener('click', () => playChord(C_MAJOR, { duration: 1.5 }));
$('arpeggio').addEventListener('click', () => arpeggiate([...C_MAJOR, 72], { interval: 0.2, duration: 1.2 }));

let sequence = null;

function start(steps, opts) {
  stopAll();
  renderSteps(steps);
  sequence = playSequence(steps, {
    bpm: 100,
    ...opts,
    onStep: (_, index) => highlight(index),
    onEnd: () => highlight(-1),
  });
}

$('scale').addEventListener('click', () => {
  const names = spellScale('C', 'major');
  const upNames = [...names, names[0]];
  const up = toMidiAscending(upNames, 4).map((midi, i) => ({ notes: [midi], label: upNames[i] }));
  start([...up, ...up.slice(0, -1).reverse()]);
});

$('loop').addEventListener('click', () => start(loopSteps(), { loop: true }));

$('swap').addEventListener('change', () => {
  const steps = loopSteps();
  renderSteps(steps);
  sequence?.setSteps(steps);
});

$('stop').addEventListener('click', () => {
  stopAll();
  highlight(-1);
});

function loopSteps() {
  const chords = diatonicChords('C', 'major');
  const vi = $('swap').checked
    ? { name: chordName('A', 'major'), notes: buildTriad('A', 'major') }
    : chords[5];
  return [chords[0], chords[4], vi, chords[3]].map((chord) => ({
    notes: toMidiAscending(chord.notes, 4),
    beats: 2,
    label: chord.name,
  }));
}

function renderSteps(steps) {
  $('steps').replaceChildren(
    ...steps.map((step) => {
      const el = document.createElement('span');
      el.className = 'step';
      el.textContent = step.label;
      return el;
    }),
  );
}

function highlight(index) {
  [...$('steps').children].forEach((el, i) => el.classList.toggle('is-active', i === index));
}
