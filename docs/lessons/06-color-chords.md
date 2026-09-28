# 06: Color chords: 7ths, 6ths, sus, add9, add11

**Status:** outlined
**Builds on:** 01, 05

## Goal
Add color to chords without changing their function, and voice extensions so they sound
clear instead of muddy.

## Key concepts
- **Seventh chords:** a triad plus one more stacked third (maj7, 7, m7, m7b5).
- **Dominant 7th:** the V7 with its tritone, the strongest pull home.
- **Sus chords:** the third replaced by the 2nd or 4th; neither major nor minor.
- **Added-tone chords:** add9, add11 and 6 chords, without the 7th.
- **Extended chords:** 9, 11, 13, which include the 7th.
- **Voicing extensions:** omitting the 5th, placing tensions on top, avoiding semitone clashes.

## Sections
1. **Sevenths from the scale:** stack one more third: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7.
2. **The dominant 7th:** the tritone returns (from lesson 02); V7–I versus V–I.
3. **Sus chords:** open and unresolved; sus4 resolving to the third.
4. **Add9 and add11:** color without jazziness; how add differs from 9 and 11.
5. **Sixth chords:** C6 and Am6, and why C6 and Am7 share notes.
6. **Voicing extensions:** drop the 5th, 9th on top, avoid the minor 3rd/9th cluster.
7. **Same loop, different colors:** one progression voiced plain, pop, trance and lo-fi style.

## Main experiment
Too much color: every chord as a maj9 or 13. The loop loses direction; less is often more.

## Quiz ideas
Ear: triad versus 7th versus sus; build a named chord on the piano.

## Components and theory
- **New:** extension picker on the chord card.
- **Theory:** `seventhChords(key)`, `buildChord(root, symbol)` with extensions and sus,
  `chordSymbol(notes)`; voicing helpers for extensions.

## Open questions
- Where does chord-symbol parsing live (theory module), and how complete should it be?
