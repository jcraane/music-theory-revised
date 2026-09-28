import { createPiano } from '../js/ui/piano.js';
import { playSequence, stopAll } from '../js/audio/player.js';
import { toMidiAscending, semitonesBetween } from '../js/theory/notes.js';
import { spellScale, scaleSteps } from '../js/theory/scales.js';
import { diatonicChords, buildTriad, notesOutsideKey } from '../js/theory/chords.js';

const $ = (id) => document.getElementById(id);
const piano = createPiano($('piano'));
createPiano($('wide'), { from: 48, octaves: 3, labels: 'all' });

// Spelled names plus the keys to play them on, rising from `octave`.
const voice = (names, octave = 4) => toMidiAscending(names, octave).map((midi, i) => ({ midi, name: names[i] }));
const tonic = () => $('tonic').value;

$('piano').addEventListener('noteplay', (e) => {
  $('event').textContent = `noteplay: ${e.detail.name} (MIDI ${e.detail.midi})`;
});
$('labels').addEventListener('change', (e) => piano.setLabels(e.target.value));
$('theme').addEventListener('change', (e) => {
  document.documentElement.dataset.theme = e.target.checked ? 'dark' : 'light';
});

function reset() {
  stopAll();
  piano.clear();
  piano.clearAnnotations();
  piano.setActive([]);
}

$('clear').addEventListener('click', reset);

// Section 1: notes light up as they play, with W and H between them.
$('scale').addEventListener('click', () => {
  reset();
  const names = spellScale(tonic(), 'major');
  const notes = voice([...names, names[0]]);
  const steps = scaleSteps('major');
  playSequence(notes.map((note) => ({ notes: [note.midi], note })), {
    bpm: 100,
    onStep: ({ note }, i) => {
      piano.highlight([note], 'scale');
      piano.setActive([note]);
      if (i > 0) piano.annotate(notes[i - 1].midi, note.midi, steps[i - 1]);
    },
    onEnd: () => piano.setActive([]),
  });
});

// Section 2: take one, skip one; roles and interval names appear step by step.
$('triad').addEventListener('click', () => {
  reset();
  const scale = voice(spellScale(tonic(), 'major'));
  piano.highlight(scale, 'scale');
  const [root, second, third, fourth, fifth] = scale;
  const interval = (a, b) => (semitonesBetween(a.name, b.name) === 4 ? 'major 3rd' : 'minor 3rd');
  const show = [
    () => piano.highlight([root], 'root'),
    () => {
      piano.highlight([second], 'skipped');
      piano.highlight([third], 'third');
      piano.annotate(root.midi, third.midi, interval(root, third));
    },
    () => {
      piano.highlight([fourth], 'skipped');
      piano.highlight([fifth], 'fifth');
      piano.annotate(third.midi, fifth.midi, interval(third, fifth));
    },
    () => {},
  ];
  const chord = [root, third, fifth];
  playSequence(
    [{ notes: [root.midi] }, { notes: [third.midi] }, { notes: [fifth.midi] }, { notes: chord.map((n) => n.midi), beats: 2 }]
      .map((step, i) => ({ ...step, show: show[i], sounding: i < 3 ? [chord[i]] : chord })),
    {
      bpm: 80,
      onStep: (step) => {
        step.show();
        piano.setActive(step.sounding);
      },
      onEnd: () => piano.setActive([]),
    },
  );
});

// Section 3: each chord of the key with its roles while it plays.
$('chords').addEventListener('click', () => {
  reset();
  const chords = diatonicChords(tonic(), 'major').map((c) => voice(c.notes));
  playSequence(chords.map((notes) => ({ notes: notes.map((n) => n.midi), chord: notes })), {
    bpm: 90,
    onStep: ({ chord }) => {
      piano.clear();
      ['root', 'third', 'fifth'].forEach((role, i) => piano.highlight([chord[i]], role));
      piano.setActive(chord);
    },
    onEnd: () => piano.setActive([]),
  });
});

// Section 6: outside-key notes stand out.
function outside(root, quality) {
  reset();
  const cMajor = spellScale('C', 'major');
  const chord = voice(buildTriad(root, quality));
  piano.highlight(chord, 'scale');
  const out = new Set(notesOutsideKey(chord.map((n) => n.name), cMajor));
  piano.highlight(chord.filter((n) => out.has(n.name)), 'outside-key');
  playSequence([{ notes: chord.map((n) => n.midi), beats: 2 }], {
    onStep: () => piano.setActive(chord),
    onEnd: () => piano.setActive([]),
  });
}
$('fm').addEventListener('click', () => outside('F', 'minor'));
$('amaj').addEventListener('click', () => outside('A', 'major'));

// Section 4: semitones counted one key at a time.
$('semitones').addEventListener('click', () => {
  reset();
  piano.highlight([{ midi: 60, name: 'C' }], 'root');
  piano.highlight([{ midi: 64, name: 'E' }], 'third');
  for (let midi = 60; midi < 64; midi++) piano.annotate(midi, midi + 1, String(midi - 59), { lane: 'below' });
  piano.annotate(60, 64, 'major 3rd');
});
