// Section 5: minor keys. A major key and its relative minor share their notes and chords;
// only the home changes, so the cards renumber and a loop re-centers on the new tonic.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createChoiceGroup } from '../../ui/choice-group.js';
import { commonTonics, relativeMinor, spellScale } from '../../theory/scales.js';
import { chordName } from '../../theory/chords.js';
import { createChordBoard } from './chord-board.js';

const READ = [
  'Every major key has a relative minor that shares all its notes. Start the C major scale ' +
    'on A instead of C and you get A natural minor: same notes, but a darker home. The chords ' +
    'are the same seven, just renumbered from the new tonic, so the pattern becomes i ii° III ' +
    "iv v VI VII. What makes something feel major or minor isn't the notes available, it's " +
    'which chord feels like home.',
];

// I–IV–V–I in the major key, then i–VI–VII–i in its relative minor, as major-key degrees.
const HEAR_DEGREES = [1, 4, 5, 1, 6, 4, 5, 6];

export default {
  id: 'minor-keys',
  title: 'Minor keys',
  render(container, ctx) {
    let major = 'C';
    let mode = 'major';

    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => board.playChords(HEAR_DEGREES.map((d) => board.step(boardDegree(d), 2)), { bpm: 100 }),
      caption: '',
      read: READ,
    });

    const board = createChordBoard(ctx, see, { legend: ['root', 'third', 'fifth', 'scale'], loop: true });

    // A major-key degree as a degree of whatever the board shows (vi of the major is i of the minor).
    const boardDegree = (degree) => (mode === 'major' ? degree : ((degree - 6 + 7) % 7) + 1);
    const tonic = () => (mode === 'major' ? major : relativeMinor(major));

    function update() {
      board.setKey(tonic(), mode);
      board.showScale(tonic(), mode);
      const minor = relativeMinor(major);
      const scale = spellScale(major, 'major');
      const [I, IV, V] = [scale[0], scale[3], scale[4]].map(prettyName);
      const i = prettyName(chordName(minor, 'minor'));
      caption.textContent = `${I}, ${IV}, ${V}, ${I}. Then ${i}, ${IV}, ${V}, ${i}: the same notes, a different home.`;
      modeToggle.setLabel('major', `${prettyName(major)} major`);
      modeToggle.setLabel('minor', `${prettyName(minor)} minor`);
    }

    const modeToggle = createChoiceGroup({
      label: 'Home',
      options: [{ value: 'major', label: '' }, { value: 'minor', label: '' }],
      value: mode,
      onChange: (value) => {
        mode = value;
        update();
      },
    });

    tryIt.append(
      h('p', {}, 'Switch between a major key and its relative minor. The cards renumber, and a loop you build keeps its numerals, so it moves to the new home.'),
      modeToggle.element,
      createKeySelector({
        tonics: commonTonics('major'),
        value: major,
        label: 'Major key',
        onChange: (value) => {
          major = value;
          update();
        },
      }).element,
      h('h3', { class: 'lesson-part__subtitle' }, 'Your loop'),
      h('p', {}, 'Pick four cards. Try one in the minor version, like i–VI–III–VII.'),
      board.loop.element,
    );

    update();
  },
};
