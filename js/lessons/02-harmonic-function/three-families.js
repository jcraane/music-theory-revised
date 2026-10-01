// Section 2: the three families. The chords of C major grouped by function, with the notes
// each stand-in shares with the main chord of its family, and a loop I–IV–V–I in which
// family members can be swapped in while it plays.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createChoiceGroup } from '../../ui/choice-group.js';
import { createPlayButton } from '../../ui/play-button.js';
import { commonTones } from '../../theory/chords.js';
import { createChordBoard } from '../common/chord-board.js';

const READ = [
  'The chords of a key fall into three families, by what they do. Tonic chords feel at rest: ' +
    'I, and its stand-ins vi and iii. Subdominant chords move away from home: IV and ii. ' +
    'Dominant chords build tension that wants to resolve home: V and vii°.',
  'Chords in a family share two of their three notes, which is why one can often replace ' +
    "another. iii is the odd one out: it's family of I, but it contains the leading tone, B, " +
    'so it already leans a bit towards V.',
];

// The main chord of each family, whose notes the stand-ins share.
const HEADS = { tonic: 1, subdominant: 4, dominant: 5 };

// The loop I–IV–V–I: the first three chords can be swapped for a family member.
const SLOTS = [[1, 6, 3], [4, 2], [5, 7], [1]];

export default {
  id: 'three-families',
  title: 'The three families',
  render(container, ctx) {
    const { see, tryIt } = sectionLayout(container, {
      listen: () => board.playChords([
        ...[1, 6, 3].map((d) => board.step(d, 1)), { notes: [], beats: 1 },
        ...[4, 2].map((d) => board.step(d, 1)), { notes: [], beats: 1 },
        ...[5, 7].map((d) => board.step(d, 1)),
      ], { bpm: 80 }),
      caption: 'The chords of C major, family by family: C, Am, Em. F, Dm. G, Bdim.',
      read: READ,
    });

    const head = (chord) => board.chords[HEADS[chord.fn.family] - 1];
    const shared = (chord) => (chord.degree === head(chord).degree ? [] : commonTones(chord.notes, head(chord).notes));

    const board = createChordBoard(ctx, see, {
      colorBy: 'function',
      groupBy: 'function',
      extra: (chord) => {
        const notes = shared(chord).map(prettyName);
        return notes.length ? `Shares ${notes.join(' and ')} with ${head(chord).roman}` : null;
      },
      onStep: (step) => {
        if (step) markShared(step.degree);
      },
    });
    board.setKey('C', 'major');

    // A bracket under the two notes a stand-in shares with its family's main chord.
    // In a root-position triad they are always next to each other.
    function markShared(degree) {
      const chord = board.chords[degree - 1];
      const names = shared(chord);
      if (!names.length) return;
      const keys = board.voicing(degree).filter((note) => names.includes(note.name)).map((note) => note.midi);
      board.piano.annotate(Math.min(...keys), Math.max(...keys), `shared with ${head(chord).roman}`, { lane: 'below' });
    }

    const choice = SLOTS.map((options) => options[0]);
    const loopSteps = () => choice.map((degree, slot) => ({ ...board.step(degree, 2), slot }));

    const loopButton = createPlayButton({
      label: 'Play loop',
      primary: false,
      play: () => board.playChords(loopSteps(), { bpm: 100, loop: true }),
    });

    const slotElements = SLOTS.map((options, slot) => {
      const label = `Chord ${slot + 1}`;
      if (options.length === 1) {
        return h('div', { class: 'swap-slot' },
          h('p', { class: 'field__label' }, label),
          h('p', { class: 'swap-slot__fixed' }, `${board.chords[options[0] - 1].roman} stays`));
      }
      return h('div', { class: 'swap-slot' }, createChoiceGroup({
        label,
        options: options.map((degree) => ({ value: String(degree), label: board.chords[degree - 1].roman })),
        value: String(options[0]),
        onChange: (value) => {
          choice[slot] = Number(value);
          // A playing loop picks up the swap from its next chord.
          loopButton.handle?.setSteps(loopSteps());
        },
      }).element);
    });

    tryIt.append(
      h('p', {}, 'Start the loop I–IV–V–I, then swap in a family member while it plays. The path stays the same; only the color changes.'),
      h('div', { class: 'swap-slots' }, slotElements),
      h('div', { class: 'button-row' }, loopButton.element),
    );
  },
};
