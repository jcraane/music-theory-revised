// Section 1: home and away. The same progression ending on V hangs; ending on I it comes
// home. Then the user picks the last chord of C–Am–F–_ and listens for which endings sound finished.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createChordBoard } from '../common/chord-board.js';

const READ = [
  'Play the chords of a key and one of them sounds like home: the tonic, I. The others all ' +
    'sound, more or less, like somewhere away from home. End a progression on I and it sounds ' +
    'finished. End it on V and it hangs in the air, waiting for more. That pull between home ' +
    'and away is what makes progressions move. The role a chord plays is called its function.',
];

const ROWS = [
  { label: 'Ends on V', degrees: [1, 6, 4, 5], outcome: 'Hanging' },
  { label: 'Ends on I', degrees: [1, 6, 4, 5, 1], outcome: 'Home' },
];
const LEAD_IN = [1, 6, 4];
const BPM = 90;

export default {
  id: 'home-and-away',
  title: 'Home and away',
  render(container, ctx) {
    const { see, tryIt } = sectionLayout(container, {
      listen: () => playRows(),
      caption: 'C, Am, F, G. Then C, Am, F, G, C.',
      read: READ,
    });

    const rowsElement = h('div', { class: 'progressions' });
    see.append(rowsElement);

    const board = createChordBoard(ctx, see, {
      onSelect: (chord) => playEnding(chord.degree),
      onStep: (step) => rowCards.forEach((cards, r) =>
        cards.forEach((card, i) => card.setActive(step?.row === r && step?.index === i))),
    });
    board.setKey('C', 'major');

    const rowCards = ROWS.map(({ label, degrees, outcome }, r) => {
      const cards = degrees.map((degree, i) => createChordCard(board.chords[degree - 1], {
        onSelect: () => board.playChords([{ ...board.step(degree, 2), row: r, index: i }], { bpm: BPM }),
        extra: i === degrees.length - 1 ? outcome : null,
      }));
      rowsElement.append(h('div', { class: 'progression' },
        h('p', { class: 'progression__label' }, label),
        h('div', { class: 'chord-row' }, cards.map((card) => card.element))));
      return cards;
    });

    function playRows() {
      const [endsOnV, endsOnI] = ROWS.map(({ degrees }, r) =>
        degrees.map((degree, i) => ({ ...board.step(degree, 2), row: r, index: i })));
      return board.playChords([...endsOnV, { notes: [], beats: 2 }, ...endsOnI], { bpm: BPM });
    }

    const picked = h('p', { class: 'progression-pick' });
    const showPick = (degree) => {
      const names = [...LEAD_IN, degree].map((d) => (d ? prettyName(board.chords[d - 1].name) : '?'));
      picked.textContent = names.join(' – ');
    };

    function playEnding(degree) {
      showPick(degree);
      return board.playChords([...LEAD_IN, degree].map((d) => board.step(d, 2)), { bpm: BPM });
    }

    tryIt.append(
      h('p', {}, 'Pick the last chord. Which endings sound finished, and which leave you hanging?'),
      picked,
      board.cardsElement,
    );
    showPick(null);
  },
};
