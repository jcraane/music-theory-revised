// Section 3: the seven chords of a key as cards, a four-chord loop builder,
// and the diminished chord resolving to I.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createPlayButton } from '../../ui/play-button.js';
import { roleLegend } from '../../ui/role-legend.js';
import { commonTonics } from '../../theory/scales.js';
import { diatonicChords } from '../../theory/chords.js';
import { voiceKeyChords, play, showTriad, midis } from './shared.js';

const READ = [
  'Build a triad on each of the seven notes and you get the seven chords of the key. Some ' +
    'sound bright (major), some darker (minor), and one sounds tense and unstable ' +
    '(diminished). In every major key the pattern is the same: major on I, IV and V, minor ' +
    "on ii, iii and vi, diminished on vii°. That's why musicians talk in Roman numerals: a " +
    'I–V–vi–IV progression sounds the same in any key.',
];

const LOOP_LENGTH = 4;

export default {
  id: 'seven-chords',
  title: 'The seven chords of a key',
  render(container, ctx) {
    let tonic = 'C';
    let chords = [];
    let voicings = [];
    let cards = [];
    let loop = []; // degrees 1–7
    let loopHandle = null;

    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => playChords([1, 2, 3, 4, 5, 6, 7].map((degree) => step(degree, 1)), { bpm: 80 }),
      caption: captionFor(tonic),
      read: READ,
    });

    const cardRow = h('div', { class: 'chord-row' });
    see.append(cardRow);
    const piano = ctx.createPiano(see, { from: 48, octaves: 3 });
    see.append(roleLegend(['root', 'third', 'fifth']));

    const step = (degree, beats, slot = null) => ({ notes: midis(voicings[degree - 1]), beats, degree, slot });

    function show({ degree, slot }) {
      cards.forEach((card, i) => card.setActive(i === degree - 1));
      slots.forEach((el, i) => el.classList.toggle('is-active', i === slot));
      piano.clear();
      showTriad(piano, voicings[degree - 1]);
      piano.setActive(voicings[degree - 1]);
    }

    function clearActive() {
      cards.forEach((card) => card.setActive(false));
      slots.forEach((el) => el.classList.remove('is-active'));
      piano.setActive([]);
    }

    function playChords(steps, options) {
      const handle = play(ctx, steps, { ...options, onStep: show });
      handle.finished.then(clearActive);
      return handle;
    }

    const loopSteps = () => loop.map((degree, slot) => step(degree, 2, slot));

    function playLoop() {
      loopHandle = playChords(loopSteps(), { bpm: 100, loop: true });
      return loopHandle;
    }

    function selectCard(chord) {
      if (loop.length === LOOP_LENGTH) loop = [];
      loop.push(chord.degree);
      renderLoop();
      if (loop.length === LOOP_LENGTH) loopButton.start();
      else playChords([step(chord.degree, 2)], { bpm: 100 });
    }

    function setKey(value) {
      tonic = value;
      chords = diatonicChords(tonic, 'major');
      voicings = voiceKeyChords(tonic, chords);
      cards = chords.map((chord) => createChordCard(chord, { onSelect: selectCard }));
      cardRow.replaceChildren(...cards.map((card) => card.element));
      caption.textContent = captionFor(tonic);
      renderLoop();
      // The same numerals keep playing, now in the new key.
      if (loopButton.playing) loopHandle.setSteps(loopSteps());
      piano.clear();
      showTriad(piano, voicings[0]);
    }

    // Loop builder
    const slots = Array.from({ length: LOOP_LENGTH }, () => h('li', { class: 'loop-slot' }));
    const loopButton = createPlayButton({ label: 'Play loop', play: playLoop, primary: false });
    const clearButton = h('button', {
      type: 'button',
      class: 'button',
      onclick: () => {
        if (loopButton.playing) loopHandle.stop();
        loop = [];
        renderLoop();
      },
    }, 'Clear');

    function renderLoop() {
      slots.forEach((el, i) => {
        const degree = loop[i];
        const chord = degree ? chords[degree - 1] : null;
        el.replaceChildren(...(chord
          ? [h('span', { class: 'loop-slot__numeral' }, chord.roman), h('span', { class: 'loop-slot__name' }, prettyName(chord.name))]
          : [h('span', { class: 'loop-slot__empty' }, String(i + 1))]));
        el.dataset.quality = chord?.quality ?? '';
        el.setAttribute('aria-label', chord ? `Chord ${i + 1}: ${chord.roman}, ${prettyName(chord.name)}` : `Chord ${i + 1}: empty`);
      });
      loopButton.element.disabled = loop.length < LOOP_LENGTH;
      clearButton.disabled = loop.length === 0;
    }

    const selector = createKeySelector({ tonics: commonTonics('major'), value: tonic, onChange: setKey });

    const resolve = createPlayButton({
      label: 'Play vii°, then I',
      primary: false,
      play: () => playChords([step(7, 2), step(1, 3)], { bpm: 90 }),
    });

    tryIt.append(
      h('p', {}, 'Click the cards to hear them. Pick four to build a loop; it plays as soon as it has four chords.'),
      h('h3', { class: 'lesson-part__subtitle' }, 'Your loop'),
      h('ol', { class: 'loop-slots' }, slots),
      h('div', { class: 'button-row' }, loopButton.element, clearButton),
      h('p', {}, 'Change the key: the loop keeps its numerals and moves with you.'),
      selector.element,
      h('h3', { class: 'lesson-part__subtitle' }, 'The unstable one'),
      h('p', {}, 'The diminished chord rarely stays on its own. Hear it, then hear where it wants to go.'),
      h('div', { class: 'button-row' }, resolve.element),
    );

    setKey(tonic);
  },
};

function captionFor(tonic) {
  return `The seven chords of ${prettyName(tonic)} major, one per beat.`;
}
