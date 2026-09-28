// Section 3: the seven chords of a key as cards, a four-chord loop builder,
// and the diminished chord resolving to I.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createPlayButton } from '../../ui/play-button.js';
import { commonTonics } from '../../theory/scales.js';
import { createChordBoard } from './chord-board.js';

const READ = [
  'Build a triad on each of the seven notes and you get the seven chords of the key. Some ' +
    'sound bright (major), some darker (minor), and one sounds tense and unstable ' +
    '(diminished). In every major key the pattern is the same: major on I, IV and V, minor ' +
    "on ii, iii and vi, diminished on vii°. That's why musicians talk in Roman numerals: a " +
    'I–V–vi–IV progression sounds the same in any key.',
];

export default {
  id: 'seven-chords',
  title: 'The seven chords of a key',
  render(container, ctx) {
    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => board.playChords([1, 2, 3, 4, 5, 6, 7].map((degree) => board.step(degree, 1)), { bpm: 80 }),
      caption: '',
      read: READ,
    });

    const board = createChordBoard(ctx, see);

    const setKey = (tonic) => {
      board.setKey(tonic, 'major');
      caption.textContent = `The seven chords of ${prettyName(tonic)} major, one per beat.`;
    };

    const resolve = createPlayButton({
      label: 'Play vii°, then I',
      primary: false,
      play: () => board.playChords([board.step(7, 2), board.step(1, 3)], { bpm: 90 }),
    });

    tryIt.append(
      h('p', {}, 'Click the cards to hear them. Pick four to build a loop; it plays as soon as it has four chords.'),
      h('h3', { class: 'lesson-part__subtitle' }, 'Your loop'),
      board.loop.element,
      h('p', {}, 'Change the key: the loop keeps its numerals and moves with you.'),
      createKeySelector({ tonics: commonTonics('major'), value: 'C', onChange: setKey }).element,
      h('h3', { class: 'lesson-part__subtitle' }, 'The unstable one'),
      h('p', {}, 'The diminished chord rarely stays on its own. Hear it, then hear where it wants to go.'),
      h('div', { class: 'button-row' }, resolve.element),
    );

    setKey('C');
  },
};
