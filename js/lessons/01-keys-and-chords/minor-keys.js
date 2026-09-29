// Section 5: minor keys. The natural minor scale with its steps, and its seven chords as
// cards and on a staff. A toggle switches to the relative major: same notes and chords,
// renumbered from a different home.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createChoiceGroup } from '../../ui/choice-group.js';
import { createPlayButton } from '../../ui/play-button.js';
import { commonTonics, relativeMajor } from '../../theory/scales.js';
import { createChordBoard } from './chord-board.js';

const READ = [
  'Every major key has a relative minor that shares all its notes. Start the C major scale ' +
    'on its 6th note, A, and you get A natural minor: the same notes, but a darker home. The ' +
    'steps now run W H W W H W W. It is the major pattern started from a different place, so ' +
    'the half steps fall between notes 2 and 3 and between 5 and 6. Counting the other way, ' +
    'the relative major starts on the 3rd note of the minor scale.',
  'The chords are the same seven too, renumbered from the new tonic: i ii° III iv v VI VII. ' +
    'The degree names stay, except for the 7th. In natural minor it sits a whole step below ' +
    'the tonic and is called the subtonic, not the leading tone. What makes music feel major ' +
    "or minor isn't the notes available, it's which chord feels like home.",
];

// I–IV–V–I in the relative major, then i–VI–VII–i in the minor, as minor-key degrees.
const BOTH_HOMES = [3, 6, 7, 3, 1, 6, 7, 1];

export default {
  id: 'minor-keys',
  title: 'Minor keys',
  render(container, ctx) {
    let minor = 'A';
    let mode = 'minor';

    const tonic = () => (mode === 'minor' ? minor : relativeMajor(minor));
    const keyName = () => `${prettyName(tonic())} ${mode}`;

    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => board.playChords([1, 2, 3, 4, 5, 6, 7].map((degree) => board.step(degree, 1)), { bpm: 80 }),
      caption: '',
      read: READ,
    });

    const board = createChordBoard(ctx, see, { legend: ['root', 'third', 'fifth', 'scale'], staff: true });

    // A minor-key degree as a degree of whatever the board shows (III of the minor is I of the major).
    const boardDegree = (degree) => (mode === 'minor' ? degree : ((degree + 4) % 7) + 1);

    const bothHomesText = h('p', {});

    function update() {
      board.setKey(tonic(), mode);
      board.showScale(tonic(), mode);
      caption.textContent = `The seven chords of ${keyName()}, one per beat.`;

      const major = relativeMajor(minor);
      const [i, I, IV, V] = [1, 3, 6, 7].map((degree) => prettyName(board.chords[boardDegree(degree) - 1].name));
      bothHomesText.textContent = `${I}, ${IV}, ${V}, ${I} comes home to ${prettyName(major)}. ` +
        `${i}, ${IV}, ${V}, ${i} uses the same notes and comes home to ${i}.`;
      modeToggle.setLabel('minor', `${prettyName(minor)} minor`);
      modeToggle.setLabel('major', `${prettyName(major)} major`);
    }

    const modeToggle = createChoiceGroup({
      label: 'Home',
      options: [{ value: 'minor', label: '' }, { value: 'major', label: '' }],
      value: mode,
      onChange: (value) => {
        mode = value;
        update();
      },
    });

    const scaleButton = createPlayButton({
      label: 'Play the scale',
      primary: false,
      play: () => board.playScale(tonic(), mode),
    });

    const bothHomes = createPlayButton({
      label: 'Play I–IV–V–I, then i–VI–VII–i',
      primary: false,
      play: () => board.playChords(BOTH_HOMES.map((degree) => board.step(boardDegree(degree), 2)), { bpm: 100 }),
    });

    tryIt.append(
      h('p', {}, 'Pick a minor key, then switch to its relative major. The notes stay the same, the cards renumber and the steps start from a new place. Click a card or a bar on the staff to hear one chord.'),
      createKeySelector({
        tonics: commonTonics('minor'),
        value: minor,
        label: 'Minor key',
        onChange: (value) => {
          minor = value;
          update();
        },
      }).element,
      modeToggle.element,
      h('div', { class: 'button-row' }, scaleButton.element),
      h('h3', { class: 'lesson-part__subtitle' }, 'Same notes, different home'),
      bothHomesText,
      h('div', { class: 'button-row' }, bothHomes.element),
    );

    update();
  },
};
