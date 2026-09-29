// Section 2: building a triad by taking one scale note, skipping one, taking one...

import { h } from '../../ui/dom.js';
import { prettyName } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { roleLegend } from '../../ui/role-legend.js';
import { spellScale } from '../../theory/scales.js';
import { voice, play, intervalBetween, midis, showTriad } from '../common/shared.js';

const READ = [
  'A chord is built by stacking every other note of the scale: take one, skip one, take ' +
    'one, skip one, take one. The result is a triad: a root, a third and a fifth. This ' +
    'stacking of thirds is the foundation of almost all Western harmony.',
];

const SCALE = spellScale('C', 'major');
// Two octaves of the scale, so a triad on any degree has the notes above it.
const KEYS = voice([...SCALE, ...SCALE], 4);

export default {
  id: 'building-a-triad',
  title: 'Building a triad',
  render(container, ctx) {
    const { see, tryIt } = sectionLayout(container, {
      listen: () => buildTriad(1, 80),
      caption: 'C, then E, then G, then all three together.',
      read: READ,
    });

    const piano = ctx.createPiano(see);
    see.append(roleLegend(['root', 'third', 'fifth', 'scale', 'skipped']));

    // The seven scale notes from the root up, and which of them the triad takes.
    const parts = (degree) => {
      const from = KEYS.slice(degree - 1, degree + 6);
      return { scale: from, chord: [from[0], from[2], from[4]], skipped: [from[1], from[3]] };
    };

    const showScale = (degree) => {
      piano.clear();
      piano.clearAnnotations();
      piano.highlight(parts(degree).scale, 'scale');
    };

    function buildTriad(degree, bpm) {
      const { chord, skipped } = parts(degree);
      const [root, third, fifth] = chord;
      showScale(degree);

      const reveal = [
        () => piano.highlight([root], 'root'),
        () => {
          piano.highlight([skipped[0]], 'skipped');
          piano.highlight([third], 'third');
          piano.annotate(root.midi, third.midi, intervalBetween(root, third));
        },
        () => {
          piano.highlight([skipped[1]], 'skipped');
          piano.highlight([fifth], 'fifth');
          piano.annotate(third.midi, fifth.midi, intervalBetween(third, fifth));
        },
        () => {},
      ];
      const steps = [
        ...chord.map((note, i) => ({ notes: [note.midi], sounding: [note], reveal: reveal[i] })),
        { notes: midis(chord), beats: 2, sounding: chord, reveal: reveal[3] },
      ];

      return play(ctx, steps, {
        bpm,
        onStep: (step) => {
          step.reveal();
          piano.setActive(step.sounding);
        },
        onEnd: () => piano.setActive([]),
      });
    }

    const buttons = SCALE.map((name, i) =>
      h('button', {
        type: 'button',
        class: 'button degree-button',
        'aria-pressed': 'false',
        'aria-label': `Build the triad on ${prettyName(name)}`,
        onclick: (e) => {
          buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
          buildTriad(i + 1, 110);
        },
      }, h('span', { class: 'degree-button__number' }, String(i + 1)), prettyName(name)),
    );

    tryIt.append(
      h('p', {}, 'Pick a note of the C major scale to build the triad that starts on it.'),
      h('div', { class: 'button-row', role: 'group', 'aria-label': 'Scale degrees' }, buttons),
    );

    // Start with the finished C major triad on the scale, so the picture is there before listening.
    const { chord, skipped } = parts(1);
    showScale(1);
    piano.highlight(skipped, 'skipped');
    showTriad(piano, chord);
    piano.annotate(chord[0].midi, chord[1].midi, intervalBetween(chord[0], chord[1]));
    piano.annotate(chord[1].midi, chord[2].midi, intervalBetween(chord[1], chord[2]));
  },
};
