// Section 7: experiment. Swap IV and V in I–IV–V–I and hear the flow run backwards:
// I–V–IV–I sounds looser, not wrong. The path strip marks the move against the flow.

import { h } from '../../ui/dom.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createPlayButton } from '../../ui/play-button.js';
import { createFlowDiagram, createFlowPath } from '../../ui/flow-diagram.js';
import { flowPath } from '../../theory/harmony.js';
import { createChordBoard } from '../common/chord-board.js';

const READ = ['Function tells you what chords tend to do. What happens if we go against it?'];

const USUAL = [1, 4, 5, 1];
const SWAPPED = [1, 5, 4, 1];
const EXPLANATION =
  'V–IV runs backwards: the tension slides sideways instead of resolving, and IV–I brings ' +
  "you home more gently. It sounds looser and more relaxed, not wrong. It's the backbone of " +
  'countless rock songs. Function explains tendencies, not laws.';

export default {
  id: 'against-the-flow',
  title: 'Experiment: against the flow',
  render(container, ctx) {
    let swapped = false;
    let shown = null;

    const { see, tryIt } = sectionLayout(container, {
      listen: () => board.playChords([
        ...steps(USUAL),
        { notes: [], beats: 2 },
        ...steps(SWAPPED),
      ], { bpm: 100 }),
      caption: 'I–IV–V–I, then I–V–IV–I, in C major.',
      read: READ,
    });

    const flow = createFlowDiagram();
    const path = createFlowPath();
    see.append(flow.element, path.element);

    const board = createChordBoard(ctx, see, {
      colorBy: 'function',
      cards: false,
      onStep: (step) => {
        if (step) showPath(step.degrees);
        flow.setActive(step ? board.chords[step.degree - 1].fn.family : null);
        path.setActive(step ? step.index : null);
      },
    });
    board.setKey('C', 'major');

    const current = () => (swapped ? SWAPPED : USUAL);
    const steps = (degrees) => degrees.map((degree, index) => ({ ...board.step(degree, 2), degrees, index }));

    function showPath(degrees) {
      if (degrees === shown) return;
      shown = degrees;
      const { backwards } = flowPath(degrees, 'major');
      path.render(degrees.map((degree) => ({ roman: board.chords[degree - 1].roman, family: board.chords[degree - 1].fn.family })), backwards);
    }

    const loopButton = createPlayButton({
      label: 'Play loop',
      primary: false,
      play: () => board.playChords(steps(current()), { bpm: 100, loop: true }),
    });

    const explanation = h('p', { class: 'swap__explanation', hidden: true }, EXPLANATION);
    const toggle = h('button', {
      type: 'button',
      class: 'button',
      'aria-pressed': 'false',
      onclick: () => {
        swapped = !swapped;
        toggle.setAttribute('aria-pressed', String(swapped));
        explanation.hidden = !swapped;
        // A playing loop picks up the swap from its next chord.
        if (loopButton.handle) loopButton.handle.setSteps(steps(current()));
        else showPath(current());
      },
    }, 'Swap IV and V');

    tryIt.append(
      h('p', {}, 'Start the loop, then swap IV and V while it plays. Listen to how the ending changes.'),
      h('div', { class: 'button-row' }, loopButton.element),
      h('div', { class: 'swap' }, toggle, explanation),
    );

    showPath(USUAL);
  },
};
