// Section 3: the seven chords of a key as cards with degree names and on a staff,
// in any major key, plus I–V–vi–IV in that key and the diminished chord resolving to I.

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
  'Each scale degree also has a name you will see often: tonic (I), supertonic (ii), ' +
    'mediant (iii), subdominant (IV), dominant (V), submediant (vi) and leading tone (vii°). ' +
    'The leading tone is a half step below the tonic and leans up towards it.',
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

    const board = createChordBoard(ctx, see, { staff: true });

    const setKey = (tonic) => {
      board.setKey(tonic, 'major');
      caption.textContent = `The seven chords of ${prettyName(tonic)} major, one per beat.`;
    };

    const progression = createPlayButton({
      label: 'Play I–V–vi–IV',
      primary: false,
      play: () => board.playChords([1, 5, 6, 4].map((degree) => board.step(degree, 2)), { bpm: 100 }),
    });

    const resolve = createPlayButton({
      label: 'Play vii°, then I',
      primary: false,
      play: () => board.playChords([board.step(7, 2), board.step(1, 3)], { bpm: 90 }),
    });

    tryIt.append(
      h('p', {}, 'Pick a major key and listen to its seven chords. Click a card or a bar on the staff to hear one chord.'),
      createKeySelector({ tonics: commonTonics('major'), value: 'C', onChange: setKey }).element,
      h('p', {}, 'The same numerals in any key: play I–V–vi–IV, then change the key and play it again.'),
      h('div', { class: 'button-row' }, progression.element),
      h('h3', { class: 'lesson-part__subtitle' }, 'The unstable one'),
      h('p', {}, 'The diminished chord rarely stays on its own. Hear it, then hear where it wants to go.'),
      h('div', { class: 'button-row' }, resolve.element),
    );

    setKey('C');
  },
};
