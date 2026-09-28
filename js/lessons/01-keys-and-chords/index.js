// Lesson 01, specified in docs/lessons/01-keys-and-chords.md.
// Sections 5–7 arrive in M6.

import majorScale from './major-scale.js';
import buildingATriad from './building-a-triad.js';
import sevenChords from './seven-chords.js';
import whyQualitiesDiffer from './why-qualities-differ.js';

const placeholder = (container) => {
  const p = document.createElement('p');
  p.textContent = 'This section is still being built.';
  container.append(p);
};

export default {
  id: 'keys-and-chords',
  title: 'Keys, scales and the chords inside them',
  summary: 'Build the seven chords of any major or minor key and hear why their qualities differ.',
  sections: [
    majorScale,
    buildingATriad,
    sevenChords,
    whyQualitiesDiffer,
    { id: 'minor-keys', title: 'Minor keys', render: placeholder },
    { id: 'sticking-out', title: 'Experiment: sticking out', render: placeholder },
    { id: 'check-yourself', title: 'Check yourself', render: placeholder },
  ],
};
