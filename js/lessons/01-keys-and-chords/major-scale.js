// Section 1: the major scale. Notes light up as they play, with W and H between them.

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { spellScale, scaleSteps, commonTonics } from '../../theory/scales.js';
import { voice, showScaleSteps, playScale } from './shared.js';

const READ = [
  'Almost every song you know is built on a scale: seven notes out of the twelve on the ' +
    'piano. The major scale always follows the same pattern of whole steps and half steps: ' +
    'W W H W W W H. Start that pattern on any key and you get a major scale. The half steps ' +
    "are what give the scale its shape: they're the spots where notes lean towards their neighbors.",
];

export default {
  id: 'major-scale',
  title: 'The major scale',
  render(container, ctx) {
    let tonic = 'C';

    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => playTonicScale(),
      caption: captionFor(tonic),
      read: READ,
    });

    const piano = ctx.createPiano(see);

    // One octave up from the tonic, including the top tonic, plus the steps between them.
    const scaleNotes = () => {
      const names = spellScale(tonic, 'major');
      return voice([...names, names[0]]);
    };

    const showScale = () => showScaleSteps(piano, scaleNotes(), scaleSteps('major'));
    const playTonicScale = () => playScale(ctx, piano, scaleNotes(), scaleSteps('major'));

    const selector = createKeySelector({
      tonics: commonTonics('major'),
      value: tonic,
      onChange: (value) => {
        tonic = value;
        caption.textContent = captionFor(tonic);
        playTonicScale();
      },
    });

    tryIt.append(
      h('p', {}, 'Pick a key and watch the same pattern start from a new note. Only the black keys you need change.'),
      selector.element,
    );

    showScale();
  },
};

function captionFor(tonic) {
  return `The ${prettyName(tonic)} major scale, up and down.`;
}
