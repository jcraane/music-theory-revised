# Chord Lab: plan for the MVP

## Goal
A personal, interactive web app for learning how chords and chord progressions work,
built around one principle: every concept is heard first, then seen, then explained.

The MVP delivers the app shell plus the first subject (keys, scales and diatonic chords),
so the lesson format can be validated before adding more subjects. Scope is personal
learning; a publishable version may follow later.

## Tech decisions
- Plain HTML, CSS and JavaScript using ES modules. No framework, no bundler, no build step.
- Tooling via mise: `mise.toml` pins Node and `serve`, and defines the `test` and `serve` tasks.
- Serve locally with `mise run serve` (ES modules don't load from file://).
- Audio: plain Web Audio API, no dependencies. Lookahead scheduler for timing.
- Theory: own small theory module (pure functions), unit-tested with Node's built-in
  test runner (`node --test`). Writing it ourselves is part of the learning.
- A minimal `package.json` with only `"type": "module"`, so Node treats the files as ES modules. No runtime dependencies.
- Storage: localStorage behind `js/storage.js`, one versioned key (`chordlab:v1`).
- No runtime dependencies from CDNs, so the app works offline.
- Theme: light and dark via CSS custom properties and prefers-color-scheme.

## Project structure (repo root)
```
music-theory-revised/
  index.html
  mise.toml           tool versions (node, serve) and tasks (test, serve)
  package.json        "type": "module"
  css/
    tokens.css        colors, type scale, spacing
    app.css           layout and components
  js/
    main.js           app shell, hash router, lesson navigation
    storage.js        load/save settings and progress
    theory/
      notes.js        pitch classes, spelling, MIDI conversion
      scales.js       major and natural minor scales
      chords.js       triads, qualities, diatonic chords, Roman numerals
    audio/
      engine.js       AudioContext, master chain (compressor, reverb), unlock on gesture
      instruments.js  "keys" (soft electric-piano-like) and "pad"
      player.js       playNote, playChord, arpeggiate, playSequence with step callbacks
    ui/
      piano.js        interactive keyboard component
      chord-card.js   chord display (name, numeral, notes, play button)
      quiz.js         reusable quiz component
    lessons/
      registry.js     list of lessons and their order
      01-keys-and-chords.js
  tests/
    theory.test.js
  docs/
    curriculum.md     lesson order, dependencies, status
    lessons/
      _template.md
      01-keys-and-chords.md
  PLAN.md
  CLAUDE.md
  README.md
```

## Module specifications

### Theory (js/theory)
Correct spelling matters: every note name in a key uses each letter once
(F major has Bb, not A#; E major has G#, not Ab).

- `pitchClass(name)` → 0–11 ("C#" → 1, "Db" → 1)
- `spellScale(tonic, mode)` → correctly spelled note names; mode is "major" or "minor"
- `scaleSteps(mode)` → step pattern; major = W W H W W W H
- `triad(scaleNotes, degree)` → { root, notes, quality } by stacking thirds within the scale
- `chordQuality(notes)` → "major" | "minor" | "diminished" | "augmented" from semitone intervals
- `romanNumeral(degree, quality)` → "I", "ii", "vii°" (uppercase major, lowercase minor, ° diminished)
- `diatonicChords(tonic, mode)` → [{ degree, roman, name, notes, quality }]
- `toMidi(noteName, octave)` and `intervalName(semitones)` ("major 3rd", "perfect 5th")

Decisions:
- Chord names: "C", "Cm", "Cdim", "Caug". Roman numerals still use ° and +.
- `intervalName(6)` is "tritone"; semitones alone can't tell an augmented 4th from a diminished 5th.
- `chordQuality` returns null for a triad that isn't one of the four qualities (e.g. C F G).
- Checking whether a note is in a key compares spelling, not pitch: Fb is outside C major.
- Theoretical keys use double accidentals (G# major has F##) to keep one letter per note.

Tests must cover at least:
- C major and A minor chord lists
- G major contains F#; F major contains Bb
- Eb major is spelled Eb F G Ab Bb C D
- Qualities per degree: major I ii iii IV V vi vii°, minor i ii° III iv v VI VII

### Audio (js/audio)
- `init()` creates the AudioContext on the first user gesture; everything else waits for it.
- `playNote(midi, { when, duration, instrument, velocity })`
- `playChord(midis, opts)` and `arpeggiate(midis, { interval, ...opts })`
- `playSequence(steps, { bpm, loop, onStep })` returns `{ stop() }`. onStep fires in sync
  with the audio (use a time-stamped queue read from requestAnimationFrame) so the UI
  can highlight what is sounding.
- Instruments: "keys" (default, short decay, clear for learning) and "pad" (slow attack).
- Stopping must fade out quickly instead of clicking.

### Piano component (js/ui/piano.js)
- Renders two octaves (configurable), responsive, SVG or DOM.
- `highlight(notes, role)` with roles: root, third, fifth, scale, outside-key.
- Clicking a key plays it and emits an event.
- Optional note labels; supports animated step-by-step highlighting for scale and triad demos.
- Respects prefers-reduced-motion.

### Lesson framework
A lesson is a module exporting:
```js
{ id, title, summary, sections: [ { id, title, render(container, ctx) } ] }
```
where `ctx` gives access to audio, theory, piano and storage.

- Hash routing: `#/` (lesson list), `#/lesson/<id>`, `#/lesson/<id>/<section>`.
- Previous/next navigation between sections; progress stored per section.
- Each section follows the pattern: hear → see → read → try.
- Lesson list shows completion state from storage.

### Storage (js/storage.js)
Stores settings (instrument, volume, theme override, note-name display),
completed sections and quiz best scores. Handles missing or corrupt data gracefully.

## Lesson content
Lesson content is specified separately from this plan:
- `docs/curriculum.md`: the order of all lessons, dependencies and status.
- `docs/lessons/_template.md`: the template every lesson spec follows.
- `docs/lessons/NN-name.md`: the full spec per lesson, including explanation text,
  interactions, experiments and quiz.

The MVP implements `docs/lessons/01-keys-and-chords.md`.

## Milestones
- **M0 Setup:** folder structure, index.html, mise.toml, package.json, README with local serve
  instructions, empty test run passes.
- **M1 Theory core** with full unit tests (write tests first).
- **M2 Audio engine:** play notes, chords, arpeggios, sequences with synced callbacks.
- **M3 Piano component** with highlighting and click-to-play.
- **M4 App shell:** router, lesson list, lesson/section navigation, storage.
- **M5 Lesson 1** sections 1–4, as specified in docs/lessons/01-keys-and-chords.md.
- **M6 Lesson 1** sections 5–7, including the quiz.
- **M7 Polish:** keyboard shortcuts (space = play/stop), focus states, reduced motion,
  light/dark theme, mobile layout check.

Each milestone ends with a working app and a short manual test checklist.

## Out of scope for the MVP
- All lessons after 01 and the genre lenses (see docs/curriculum.md).
- Progression builder with MIDI export.
- Web MIDI input from a keyboard.
- Ear training game modes beyond the lesson quizzes.
