// Section 6: function in minor, a preview. The families carry over to minor, but natural
// minor's 7th is a whole step below the tonic, so v has no leading tone and v–i pulls
// weakly. V–I in the relative major is the comparison. Any minor key.

import { h } from '../../ui/dom.js';
import { prettyName, functionLabel } from '../../ui/format.js';
import { sectionLayout } from '../../ui/section-layout.js';
import { createKeySelector } from '../../ui/key-selector.js';
import { createChordCard } from '../../ui/chord-card.js';
import { createPlayButton } from '../../ui/play-button.js';
import { roleLegend } from '../../ui/role-legend.js';
import { commonTonics, relativeMajor } from '../../theory/scales.js';
import { diatonicChords } from '../../theory/chords.js';
import { functionOf } from '../../theory/harmony.js';
import { toMidi } from '../../theory/notes.js';
import { keyOctave, voiceOn, voiceKeyChords, play, showTriad, midis } from '../common/shared.js';

const READ = [
  'The families work in minor too: i, III and VI are home, ii° and iv move away, v and VII ' +
    'are the dominants. But natural minor has a catch. Its 7th note, G in A minor, is a whole ' +
    'step below the tonic: the subtonic from lesson 01. So v has no leading tone, and v–i ' +
    'sounds soft, more of a sigh than a pull. Composers fix this by changing one note, which ' +
    'is where lesson 07 picks up.',
  'VII does a similar job without a leading tone, which gives minor-key endings like VI–VII–i ' +
    'their own open sound. More on that in lesson 03.',
];

const BPM = 80;

export default {
  id: 'minor-preview',
  title: 'Function in minor, a preview',
  render(container, ctx) {
    let key = null;
    let cards = [];

    const { see, tryIt, caption } = sectionLayout(container, {
      listen: () => playSteps([...key.majorPair, ...key.minorPair]),
      caption: '',
      read: READ,
    });

    const cardRow = h('div', { class: 'chord-row' });
    see.append(cardRow);
    const piano = ctx.createPiano(see, { from: 48, octaves: 3 });
    see.append(roleLegend(['root', 'third', 'fifth', 'scale']));

    // V and v just below their tonics, so the step into the tonic sits next to it on the keys.
    function keyFor(minor) {
      const major = relativeMajor(minor);
      const minorChords = diatonicChords(minor, 'minor').map((chord) => ({ ...chord, fn: functionOf(chord.degree, 'minor') }));
      const majorChords = diatonicChords(major, 'major');
      const minorTonic = toMidi(minor, keyOctave(minor));
      const majorTonic = minorTonic + 3;
      const pair = (dominant, tonic, degrees) => [
        { notes: dominant, beats: 2, degree: degrees[0] },
        { notes: tonic, beats: 2, degree: degrees[1] },
      ];
      const minorI = voiceOn(minorChords[0].notes, minorTonic);
      const minorV = voiceOn(minorChords[4].notes, minorTonic - 5);
      const majorI = voiceOn(majorChords[0].notes, majorTonic);
      const majorV = voiceOn(majorChords[4].notes, majorTonic - 5);
      return {
        minor,
        major,
        minorChords,
        voicings: voiceKeyChords(minor, 'minor', minorChords),
        majorPair: pair(majorV, majorI, [null, null]),
        minorPair: pair(minorV, minorI, [5, 1]),
        // The note below each tonic: the leading tone in major, the subtonic in minor.
        leading: majorV[1],
        majorTonic: majorI[0],
        subtonic: minorV[1],
        minorTonic: minorI[0],
        names: { V: majorChords[4].name, I: majorChords[0].name, v: minorChords[4].name, i: minorChords[0].name },
      };
    }

    function show({ notes, degree }) {
      piano.clear();
      showTriad(piano, notes);
      piano.setActive(notes);
      cards.forEach((card, i) => card.setActive(i === degree - 1));
    }

    function showSteps() {
      piano.clear();
      piano.setActive([]);
      piano.highlight([key.leading, key.majorTonic, key.subtonic, key.minorTonic], 'scale');
      cards.forEach((card) => card.setActive(false));
    }

    function playSteps(steps) {
      return play(ctx, steps.map((step) => ({ ...step, notes: midis(step.notes), voiced: step.notes })), {
        bpm: BPM,
        onStep: ({ voiced, degree }) => show({ notes: voiced, degree }),
        onEnd: showSteps,
      });
    }

    function setKey(minor) {
      key = keyFor(minor);
      const { V, I, v, i } = Object.fromEntries(Object.entries(key.names).map(([k, name]) => [k, prettyName(name)]));
      const majorName = `${prettyName(key.major)} major`;
      const minorName = `${prettyName(minor)} minor`;

      cards = key.minorChords.map((chord, index) => createChordCard(chord, {
        onSelect: () => playSteps([{ notes: key.voicings[index], beats: 2, degree: chord.degree }]),
        detail: functionLabel(chord.fn),
      }));
      cardRow.replaceChildren(...cards.map((card) => card.element));

      piano.clearAnnotations();
      piano.annotate(key.leading.midi, key.majorTonic.midi,
        `${prettyName(key.leading.name)} to ${prettyName(key.major)}: half step`);
      piano.annotate(key.subtonic.midi, key.minorTonic.midi,
        `${prettyName(key.subtonic.name)} to ${prettyName(minor)}: whole step`, { lane: 'below' });
      showSteps();

      caption.textContent = `${V}–${I} in ${majorName}, then ${v}–${i} in ${minorName}.`;
      buttonRow.replaceChildren(
        createPlayButton({ label: `Play V–I in ${majorName}`, primary: false, play: () => playSteps(key.majorPair) }).element,
        createPlayButton({ label: `Play v–i in ${minorName}`, primary: false, play: () => playSteps(key.minorPair) }).element,
      );
    }

    const buttonRow = h('div', { class: 'button-row' });

    tryIt.append(
      h('p', {}, 'Pick a minor key and compare the two endings. Click a card to hear one chord.'),
      createKeySelector({ tonics: commonTonics('minor'), value: 'A', label: 'Minor key', onChange: setKey }).element,
      buttonRow,
    );

    setKey('A');
  },
};
