// Section 4: the usual flow. Tonic → subdominant → dominant → tonic as a diagram that
// follows the music, and a four-chord loop builder that reads the path of the user's loop.

import { h } from '../../ui/dom.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createFlowDiagram } from '../../ui/flow-diagram.js';
import { commonTonics } from '../../theory/scales.js';
import { flowPath } from '../../theory/harmony.js';
import { createChordBoard } from '../common/chord-board.js';

const READ = [
  'Many progressions take the same path: start at home, move away, build tension, come ' +
    'home. Tonic, subdominant, dominant, tonic. I–IV–V–I is the plainest version. Swap in ' +
    'family members and you get I–ii–V–I, I–vi–IV–V and countless others. Think of it as the ' +
    'grammar of harmony: not a rule, but the path most songs take.',
];

const HEAR = [[1, 4, 5, 1], [1, 2, 5, 1], [1, 6, 4, 5, 1]];
const LETTER = { tonic: 'T', subdominant: 'S', dominant: 'D' };

export default {
  id: 'usual-flow',
  title: 'The usual flow',
  render(container, ctx) {
    const { see, tryIt } = sectionLayout(container, {
      listen: () => board.playChords(
        HEAR.flatMap((degrees, i) => [...(i ? [{ notes: [], beats: 2 }] : []), ...degrees.map((d) => board.step(d, 2))]),
        { bpm: 100 },
      ),
      caption: 'I–IV–V–I, then I–ii–V–I, then I–vi–IV–V–I.',
      read: READ,
    });

    const flow = createFlowDiagram();
    see.append(flow.element);

    const board = createChordBoard(ctx, see, {
      colorBy: 'function',
      loop: true,
      onStep: (step) => flow.setActive(step ? board.chords[step.degree - 1].fn.family : null),
      onLoopChange: (degrees) => {
        path.textContent = describePath(degrees);
      },
    });
    board.setKey('C', 'major');

    const path = h('p', { class: 'loop-path', 'aria-live': 'polite' }, describePath([]));

    tryIt.append(
      h('p', {}, 'Build a loop: click four chord cards. It starts playing when the fourth is picked, and the diagram follows along.'),
      createKeySelector({ tonics: commonTonics('major'), value: 'C', onChange: (tonic) => board.setKey(tonic, 'major') }).element,
      board.loop.element,
      path,
    );
  },
};

function describePath(degrees) {
  if (degrees.length < 4) return 'Pick four chords to hear your loop.';
  const { functions, backwards } = flowPath(degrees, 'major', { loop: true });
  const letters = functions.map((family) => LETTER[family]).join(' ');
  return backwards.length
    ? `${letters}: from tension back to away, against the usual flow. Listen to how that feels.`
    : `${letters}: the usual flow.`;
}
