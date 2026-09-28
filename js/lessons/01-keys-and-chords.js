// Lesson 01, specified in docs/lessons/01-keys-and-chords.md.
// Section content arrives in M5 (sections 1–4) and M6 (sections 5–7).

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
    { id: 'major-scale', title: 'The major scale', render: placeholder },
    { id: 'building-a-triad', title: 'Building a triad', render: placeholder },
    { id: 'seven-chords', title: 'The seven chords of a key', render: placeholder },
    { id: 'why-qualities-differ', title: 'Why the qualities differ', render: placeholder },
    { id: 'minor-keys', title: 'Minor keys', render: placeholder },
    { id: 'sticking-out', title: 'Experiment: sticking out', render: placeholder },
    { id: 'check-yourself', title: 'Check yourself', render: placeholder },
  ],
};
