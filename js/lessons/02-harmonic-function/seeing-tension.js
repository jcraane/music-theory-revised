// Section 5: seeing tension. A progression drawn as a tension curve whose bars light up as
// the chords play; the user picks one of a few progressions and loops it.

import { h } from '../../ui/dom.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createChoiceGroup } from '../../ui/choice-group.js';
import { createPlayButton } from '../../ui/play-button.js';
import { createTensionCurve } from '../../ui/tension-curve.js';
import { tension } from '../../theory/harmony.js';
import { createChordBoard } from '../common/chord-board.js';

const READ = [
  'Give each chord a rough number for how far it is from home, and a progression gets a ' +
    "shape. Home, I, is 0. vi is 1, and iii is 1.5: it's family of I, but it contains the " +
    'leading tone, so it already leans towards V. IV is 2 and ii is 2.5, since ii pushes ' +
    'harder towards V. V is 3, and vii°, with its tritone, is 4. I–vi–IV–V climbs step by ' +
    'step and falls back home when it starts again.',
  'These numbers are a teaching model, not a law. Real tension also depends on melody, ' +
    'rhythm and loudness. But the shape they draw is roughly what you hear.',
];

const PROGRESSIONS = [[1, 6, 4, 5], [1, 5, 6, 4], [6, 4, 1, 5], [1, 3, 4, 5], [1, 2, 5, 1]];
const NOTES = { 3: 'leans towards V' };

export default {
  id: 'seeing-tension',
  title: 'Seeing tension',
  render(container, ctx) {
    let degrees = PROGRESSIONS[0];

    const { see, tryIt } = sectionLayout(container, {
      // I–vi–IV–V twice, then home. The curve shows I–vi–IV–V, so the last I is its first
      // bar; afterwards it shows the chosen progression again.
      listen: () => {
        showCurve(PROGRESSIONS[0]);
        const steps = [...PROGRESSIONS[0], ...PROGRESSIONS[0], 1].map((degree, i) => ({ ...board.step(degree, 2), index: i % 4 }));
        const handle = board.playChords(steps, { bpm: 100 });
        handle.finished.then(() => showCurve(degrees));
        return handle;
      },
      caption: 'I–vi–IV–V twice, then I, in C major.',
      read: READ,
    });

    const curve = createTensionCurve();
    see.append(curve.element);

    const board = createChordBoard(ctx, see, {
      colorBy: 'function',
      cards: false,
      onStep: (step) => curve.setActive(step ? step.index : null),
    });
    board.setKey('C', 'major');

    const numerals = (list) => list.map((d) => board.chords[d - 1].roman).join('–');

    function showCurve(list) {
      curve.render(list.map((degree) => {
        const chord = board.chords[degree - 1];
        return { roman: chord.roman, family: chord.fn.family, tension: tension(degree, 'major'), note: NOTES[degree] };
      }));
    }

    const loopSteps = () => degrees.map((degree, index) => ({ ...board.step(degree, 2), index }));
    const loopButton = createPlayButton({
      label: 'Play loop',
      primary: false,
      play: () => {
        showCurve(degrees);
        return board.playChords(loopSteps(), { bpm: 100, loop: true });
      },
    });

    const choice = createChoiceGroup({
      label: 'Progression',
      options: PROGRESSIONS.map((list, i) => ({ value: String(i), label: numerals(list) })),
      value: '0',
      onChange: (value) => {
        degrees = PROGRESSIONS[Number(value)];
        showCurve(degrees);
        // A playing loop switches from its next chord.
        loopButton.handle?.setSteps(loopSteps());
      },
    });

    tryIt.append(
      h('p', {}, 'Choose a progression and look at its curve before you play it. Can you hear the shape?'),
      choice.element,
      h('div', { class: 'button-row' }, loopButton.element),
    );

    showCurve(degrees);
  },
};
