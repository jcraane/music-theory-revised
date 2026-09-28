# Curriculum

The map of Chord Lab: which lessons exist, in what order, what each builds on, and how
far along each one is. Full content lives in `docs/lessons/`, one file per lesson,
following `docs/lessons/_template.md`.

Status: **idea** (only listed here) → **outlined** (lesson file with goal, concepts, section
titles and main experiment) → **specified** (full spec following the template) → **built**
(implemented in the app). Only specified lessons are ready to implement.

## Core track

| # | Lesson | Goal | Builds on | Status |
|---|--------|------|-----------|--------|
| 01 | Keys, scales and the chords inside them | Build the seven chords of any major or minor key and hear why their qualities differ | – | specified |
| 02 | Harmonic function: home, away, tension | Hear tonic, subdominant and dominant roles and predict how chords want to move | 01 | outlined |
| 03 | Cadences: how phrases end | Recognize authentic, plagal, half and deceptive cadences by ear | 02 | outlined |
| 04 | Root motion and the circle of fifths | See and hear why moves by 5ths feel strong, by 3rds soft, by steps like climbing | 01, 02 | outlined |
| 05 | Inversions and voice leading | Make progressions flow with inversions, common tones and small steps | 01 | outlined |
| 06 | Color chords: 7ths, 6ths, sus, add9, add11 | Add color without changing a chord's function, and voice extensions well | 01, 05 | outlined |
| 07 | Minor keys in depth | Natural, harmonic and melodic minor; why the major V in minor pulls so hard | 01, 02 | outlined |
| 08 | Borrowed chords and modal mixture | Use iv, bVI, bVII and the Picardy third to shift emotion | 02, 07 | outlined |
| 09 | Modes as moods | Hear Dorian, Mixolydian, Lydian and Phrygian by their characteristic note | 01, 08 | outlined |
| 10 | Secondary dominants | Briefly point to chords other than the tonic (V/V, V/vi) | 02, 03, 06 | outlined |
| 11 | Tension devices | Pedal points, line clichés, chromatic mediants, key changes, planing | 04, 05, 08, 10 | outlined |
| 12 | Harmonic rhythm and arrangement | How chord length, bass lines and splitting harmony across layers shape emotion | 05, 06 | outlined |

## Genre lenses

Each lens reuses concepts from the core track with a sound preset and a few signature
progressions to dissect.

| Lens | Focus | Builds on | Status |
|------|-------|-----------|--------|
| Trance and EDM | Natural minor loops, slow harmonic rhythm, sus/add9, pedal bass, the major lift | 01, 06, 08, 11, 12 | idea |
| Pop | Four-chord loops, the vi–IV–I–V family, borrowed iv | 01, 02, 08 | idea |
| Jazz | ii–V–I chains, 7ths and extensions, tritone substitution | 02, 04, 06, 10 | idea |
| Blues and rock | Dominant 7ths everywhere, the 12-bar form, bVII | 02, 06, 08 | idea |
| Lo-fi and neo-soul | maj7/m9 chords, chromatic passing chords, smooth voicings | 05, 06, 10 | idea |
| Film and epic | Modal mixture, chromatic mediants, planing, pedal points | 08, 09, 11 | idea |

## Shared components by first use

Tracks which lesson introduces a reusable component, so the cost of a lesson is visible.

| Component | First needed in |
|-----------|-----------------|
| Piano keyboard | 01 |
| Chord card | 01 |
| Quiz | 01 |
| Sequence player with synced highlighting | 01 |
| Tension meter | 02 |
| Phrase player (chords with a simple top line) | 03 |
| Circle of fifths | 04 |
| Voice-leading view | 05 |
| Swap-a-chord experiment | 08 |
| Drone and mode playground | 09 |
| Progression builder with MIDI export | 12 |
| Layer mixer | 12 |
