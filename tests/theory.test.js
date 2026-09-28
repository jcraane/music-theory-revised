import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { pitchClass, toMidi, intervalName, semitonesBetween } from '../js/theory/notes.js';
import { scaleSteps, spellScale, relativeMinor, relativeMajor } from '../js/theory/scales.js';
import {
  triad,
  chordQuality,
  romanNumeral,
  chordName,
  diatonicChords,
  buildTriad,
  notesOutsideKey,
} from '../js/theory/chords.js';

// The 15 major and 15 minor keys with standard key signatures.
const MAJOR_TONICS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
const MINOR_TONICS = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'];

const letters = (notes) => notes.map((n) => n[0]);

describe('pitchClass', () => {
  test('naturals', () => {
    assert.deepEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(pitchClass), [0, 2, 4, 5, 7, 9, 11]);
  });

  test('enharmonic sharps and flats match', () => {
    assert.equal(pitchClass('C#'), 1);
    assert.equal(pitchClass('Db'), 1);
    assert.equal(pitchClass('A#'), pitchClass('Bb'));
  });

  test('wraps around the octave', () => {
    assert.equal(pitchClass('B#'), 0);
    assert.equal(pitchClass('Cb'), 11);
    assert.equal(pitchClass('E#'), 5);
    assert.equal(pitchClass('Fb'), 4);
  });

  test('double accidentals', () => {
    assert.equal(pitchClass('F##'), 7);
    assert.equal(pitchClass('Bbb'), 9);
  });

  test('rejects invalid names', () => {
    for (const bad of ['', 'H', 'c', 'C#b', 'C###', 'Cbbb', 'C4', 42, null]) {
      assert.throws(() => pitchClass(bad), `expected ${bad} to throw`);
    }
  });
});

describe('semitonesBetween', () => {
  test('counts upwards from the first note', () => {
    assert.equal(semitonesBetween('C', 'E'), 4);
    assert.equal(semitonesBetween('D', 'F'), 3);
    assert.equal(semitonesBetween('B', 'D'), 3);
    assert.equal(semitonesBetween('G', 'C'), 5);
    assert.equal(semitonesBetween('C', 'C'), 0);
  });
});

describe('toMidi', () => {
  test('uses C4 = 60', () => {
    assert.equal(toMidi('C', 4), 60);
    assert.equal(toMidi('A', 4), 69);
    assert.equal(toMidi('C', -1), 0);
    assert.equal(toMidi('G', 9), 127);
  });

  test('octave number belongs to the letter', () => {
    assert.equal(toMidi('B#', 3), 60);
    assert.equal(toMidi('Cb', 4), 59);
    assert.equal(toMidi('C#', 4), 61);
    assert.equal(toMidi('Db', 4), 61);
  });

  test('rejects invalid octaves', () => {
    assert.throws(() => toMidi('C', 4.5));
    assert.throws(() => toMidi('C', '4'));
  });
});

describe('intervalName', () => {
  test('names every interval within an octave', () => {
    assert.deepEqual(
      Array.from({ length: 13 }, (_, i) => intervalName(i)),
      [
        'unison', 'minor 2nd', 'major 2nd', 'minor 3rd', 'major 3rd', 'perfect 4th', 'tritone',
        'perfect 5th', 'minor 6th', 'major 6th', 'minor 7th', 'major 7th', 'octave',
      ],
    );
  });

  test('rejects values outside 0-12', () => {
    for (const bad of [-1, 13, 2.5, '3']) {
      assert.throws(() => intervalName(bad), `expected ${bad} to throw`);
    }
  });
});

describe('scaleSteps', () => {
  test('major is W W H W W W H', () => {
    assert.deepEqual(scaleSteps('major'), ['W', 'W', 'H', 'W', 'W', 'W', 'H']);
  });

  test('natural minor is W H W W H W W', () => {
    assert.deepEqual(scaleSteps('minor'), ['W', 'H', 'W', 'W', 'H', 'W', 'W']);
  });

  test('returns a fresh copy', () => {
    scaleSteps('major').pop();
    assert.equal(scaleSteps('major').length, 7);
  });

  test('rejects unknown modes', () => {
    assert.throws(() => scaleSteps('dorian'));
  });
});

describe('spellScale', () => {
  test('C major and A minor', () => {
    assert.deepEqual(spellScale('C', 'major'), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    assert.deepEqual(spellScale('A', 'minor'), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });

  test('G major contains F#', () => {
    const g = spellScale('G', 'major');
    assert.ok(g.includes('F#'));
    assert.ok(!g.includes('Gb'));
  });

  test('F major contains Bb, not A#', () => {
    const f = spellScale('F', 'major');
    assert.ok(f.includes('Bb'));
    assert.ok(!f.includes('A#'));
  });

  test('E major contains G#, not Ab', () => {
    assert.deepEqual(spellScale('E', 'major'), ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']);
  });

  test('Eb major is spelled Eb F G Ab Bb C D', () => {
    assert.deepEqual(spellScale('Eb', 'major'), ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']);
  });

  test('keys at the edge of the circle of fifths', () => {
    assert.deepEqual(spellScale('F#', 'major'), ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
    assert.deepEqual(spellScale('Gb', 'major'), ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']);
    assert.deepEqual(spellScale('D#', 'minor'), ['D#', 'E#', 'F#', 'G#', 'A#', 'B', 'C#']);
  });

  test('uses double accidentals rather than repeating a letter', () => {
    assert.deepEqual(spellScale('G#', 'major'), ['G#', 'A#', 'B#', 'C#', 'D#', 'E#', 'F##']);
    assert.deepEqual(spellScale('Fb', 'major'), ['Fb', 'Gb', 'Ab', 'Bbb', 'Cb', 'Db', 'Eb']);
  });

  for (const [mode, tonics] of [['major', MAJOR_TONICS], ['minor', MINOR_TONICS]]) {
    test(`every ${mode} key uses each letter once and follows the step pattern`, () => {
      const semis = scaleSteps(mode).map((s) => (s === 'W' ? 2 : 1));
      for (const tonic of tonics) {
        const scale = spellScale(tonic, mode);
        assert.equal(scale[0], tonic);
        assert.equal(new Set(letters(scale)).size, 7, `${tonic} ${mode}: ${scale.join(' ')}`);
        for (let i = 0; i < 7; i++) {
          assert.equal(
            semitonesBetween(scale[i], scale[(i + 1) % 7]),
            semis[i],
            `${tonic} ${mode}: step ${scale[i]}-${scale[(i + 1) % 7]}`,
          );
        }
      }
    });
  }

  test('rejects invalid input', () => {
    assert.throws(() => spellScale('H', 'major'));
    assert.throws(() => spellScale('C', 'lydian'));
  });
});

describe('relativeMinor and relativeMajor', () => {
  test('relative minor', () => {
    assert.equal(relativeMinor('C'), 'A');
    assert.equal(relativeMinor('Eb'), 'C');
    assert.equal(relativeMinor('F#'), 'D#');
    assert.equal(relativeMinor('F'), 'D');
  });

  test('relative major', () => {
    assert.equal(relativeMajor('A'), 'C');
    assert.equal(relativeMajor('D#'), 'F#');
    assert.equal(relativeMajor('G'), 'Bb');
  });

  test('round trips for every standard key', () => {
    for (const tonic of MAJOR_TONICS) {
      assert.equal(relativeMajor(relativeMinor(tonic)), tonic);
    }
  });

  test('relative keys share the same notes', () => {
    for (const tonic of MAJOR_TONICS) {
      assert.deepEqual(
        [...spellScale(relativeMinor(tonic), 'minor')].sort(),
        [...spellScale(tonic, 'major')].sort(),
      );
    }
  });
});

describe('chordQuality', () => {
  test('recognizes the four triad qualities', () => {
    assert.equal(chordQuality(['C', 'E', 'G']), 'major');
    assert.equal(chordQuality(['D', 'F', 'A']), 'minor');
    assert.equal(chordQuality(['B', 'D', 'F']), 'diminished');
    assert.equal(chordQuality(['C', 'E', 'G#']), 'augmented');
  });

  test('works across the octave boundary and with accidentals', () => {
    assert.equal(chordQuality(['A', 'C#', 'E']), 'major');
    assert.equal(chordQuality(['F', 'Ab', 'C']), 'minor');
    assert.equal(chordQuality(['G#', 'B', 'D']), 'diminished');
  });

  test('returns null for anything that is not one of the four triads', () => {
    assert.equal(chordQuality(['C', 'F', 'G']), null);
    assert.equal(chordQuality(['C', 'E', 'Gb']), null);
    assert.equal(chordQuality(['C', 'E']), null);
    assert.equal(chordQuality(['C', 'E', 'G', 'B']), null);
  });
});

describe('romanNumeral', () => {
  test('uppercase major, lowercase minor, ° diminished, + augmented', () => {
    assert.equal(romanNumeral(1, 'major'), 'I');
    assert.equal(romanNumeral(2, 'minor'), 'ii');
    assert.equal(romanNumeral(7, 'diminished'), 'vii°');
    assert.equal(romanNumeral(3, 'augmented'), 'III+');
  });

  test('rejects invalid input', () => {
    assert.throws(() => romanNumeral(0, 'major'));
    assert.throws(() => romanNumeral(8, 'major'));
    assert.throws(() => romanNumeral(1, 'sus4'));
  });
});

describe('chordName', () => {
  test('appends a suffix per quality', () => {
    assert.equal(chordName('C', 'major'), 'C');
    assert.equal(chordName('A', 'minor'), 'Am');
    assert.equal(chordName('B', 'diminished'), 'Bdim');
    assert.equal(chordName('C', 'augmented'), 'Caug');
    assert.equal(chordName('F#', 'minor'), 'F#m');
  });
});

describe('triad', () => {
  const cMajor = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

  test('stacks thirds within the scale', () => {
    assert.deepEqual(triad(cMajor, 1), { root: 'C', notes: ['C', 'E', 'G'], quality: 'major' });
    assert.deepEqual(triad(cMajor, 2), { root: 'D', notes: ['D', 'F', 'A'], quality: 'minor' });
    assert.deepEqual(triad(cMajor, 7), { root: 'B', notes: ['B', 'D', 'F'], quality: 'diminished' });
  });

  test('wraps around the top of the scale', () => {
    assert.deepEqual(triad(cMajor, 6).notes, ['A', 'C', 'E']);
  });

  test('rejects invalid degrees', () => {
    assert.throws(() => triad(cMajor, 0));
    assert.throws(() => triad(cMajor, 8));
    assert.throws(() => triad(cMajor, 1.5));
  });
});

describe('diatonicChords', () => {
  test('C major', () => {
    assert.deepEqual(diatonicChords('C', 'major'), [
      { degree: 1, roman: 'I', name: 'C', notes: ['C', 'E', 'G'], quality: 'major' },
      { degree: 2, roman: 'ii', name: 'Dm', notes: ['D', 'F', 'A'], quality: 'minor' },
      { degree: 3, roman: 'iii', name: 'Em', notes: ['E', 'G', 'B'], quality: 'minor' },
      { degree: 4, roman: 'IV', name: 'F', notes: ['F', 'A', 'C'], quality: 'major' },
      { degree: 5, roman: 'V', name: 'G', notes: ['G', 'B', 'D'], quality: 'major' },
      { degree: 6, roman: 'vi', name: 'Am', notes: ['A', 'C', 'E'], quality: 'minor' },
      { degree: 7, roman: 'vii°', name: 'Bdim', notes: ['B', 'D', 'F'], quality: 'diminished' },
    ]);
  });

  test('A minor', () => {
    assert.deepEqual(diatonicChords('A', 'minor'), [
      { degree: 1, roman: 'i', name: 'Am', notes: ['A', 'C', 'E'], quality: 'minor' },
      { degree: 2, roman: 'ii°', name: 'Bdim', notes: ['B', 'D', 'F'], quality: 'diminished' },
      { degree: 3, roman: 'III', name: 'C', notes: ['C', 'E', 'G'], quality: 'major' },
      { degree: 4, roman: 'iv', name: 'Dm', notes: ['D', 'F', 'A'], quality: 'minor' },
      { degree: 5, roman: 'v', name: 'Em', notes: ['E', 'G', 'B'], quality: 'minor' },
      { degree: 6, roman: 'VI', name: 'F', notes: ['F', 'A', 'C'], quality: 'major' },
      { degree: 7, roman: 'VII', name: 'G', notes: ['G', 'B', 'D'], quality: 'major' },
    ]);
  });

  test('examples from the lesson quiz', () => {
    assert.equal(diatonicChords('G', 'major')[5].name, 'Em');
    assert.deepEqual(diatonicChords('D', 'major')[3].notes, ['G', 'B', 'D']);
  });

  test('every major key has the pattern I ii iii IV V vi vii°', () => {
    for (const tonic of MAJOR_TONICS) {
      assert.deepEqual(
        diatonicChords(tonic, 'major').map((c) => c.roman),
        ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
        tonic,
      );
    }
  });

  test('every minor key has the pattern i ii° III iv v VI VII', () => {
    for (const tonic of MINOR_TONICS) {
      assert.deepEqual(
        diatonicChords(tonic, 'minor').map((c) => c.roman),
        ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
        tonic,
      );
    }
  });

  test('chords in a flat key keep the key spelling', () => {
    assert.deepEqual(
      diatonicChords('Eb', 'major').map((c) => c.name),
      ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    );
  });
});

describe('buildTriad', () => {
  test('builds any quality on any root, spelled by letter', () => {
    assert.deepEqual(buildTriad('F', 'minor'), ['F', 'Ab', 'C']);
    assert.deepEqual(buildTriad('A', 'major'), ['A', 'C#', 'E']);
    assert.deepEqual(buildTriad('B', 'diminished'), ['B', 'D', 'F']);
    assert.deepEqual(buildTriad('C', 'augmented'), ['C', 'E', 'G#']);
    assert.deepEqual(buildTriad('Eb', 'minor'), ['Eb', 'Gb', 'Bb']);
    assert.deepEqual(buildTriad('G#', 'major'), ['G#', 'B#', 'D#']);
  });

  test('agrees with chordQuality', () => {
    for (const quality of ['major', 'minor', 'diminished', 'augmented']) {
      for (const root of MAJOR_TONICS) {
        assert.equal(chordQuality(buildTriad(root, quality)), quality, `${root} ${quality}`);
      }
    }
  });

  test('rejects unknown qualities', () => {
    assert.throws(() => buildTriad('C', 'sus4'));
  });
});

describe('notesOutsideKey', () => {
  const cMajor = spellScale('C', 'major');

  test('flags the notes that are not in the key', () => {
    assert.deepEqual(notesOutsideKey(buildTriad('F', 'minor'), cMajor), ['Ab']);
    assert.deepEqual(notesOutsideKey(buildTriad('A', 'major'), cMajor), ['C#']);
  });

  test('returns an empty list for diatonic chords', () => {
    for (const chord of diatonicChords('C', 'major')) {
      assert.deepEqual(notesOutsideKey(chord.notes, cMajor), []);
    }
  });

  test('compares spelling, not just pitch', () => {
    assert.deepEqual(notesOutsideKey(['Fb'], cMajor), ['Fb']);
  });
});
