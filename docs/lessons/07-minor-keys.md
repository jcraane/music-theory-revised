# 07: Minor keys in depth

**Status:** outlined
**Builds on:** 01, 02

## Goal
Understand natural, harmonic and melodic minor, and why the major V in minor pulls so hard.

## Key concepts
- **Natural minor:** the relative-minor scale from lesson 01.
- **Harmonic minor:** natural minor with a raised 7th, creating a leading tone.
- **Augmented second:** the 3-semitone gap between degrees 6 and 7 in harmonic minor.
- **Melodic minor:** raised 6th and 7th (traditionally when ascending).
- **Borrowed-from-harmonic chords:** V, V7 and vii° in minor; III+ as a side effect.

## Sections
1. **Natural minor recap:** the weak minor v.
2. **Raising the 7th:** harmonic minor; E major in A minor.
3. **The exotic gap:** the augmented second (F–G# in A minor) and its sound.
4. **Melodic minor:** smoothing the gap by raising the 6th as well.
5. **Which chords change:** V, vii°, III+ from harmonic; IV major and ii from melodic.
6. **What music really does:** mostly natural minor, with a major V at cadences.

## Main experiment
Am–Dm–Em–Am versus Am–Dm–E–Am. One note (G#) changes the ending completely.

## Quiz ideas
Which minor scale is this; ear: minor v or major V.

## Components and theory
- **New:** minor-type selector on the scale view.
- **Theory:** `spellScale` for harmonic and melodic minor, including double sharps
  (G# harmonic minor has F##). Tests for these edge cases.

## Open questions
- Show ascending/descending melodic minor, or only the jazz version (same both ways)?
- Define `tension()` for minor (left open in lesson 02): the weak v and VII against the
  major V, and where ii° goes, since it contains the same tritone as vii° in major.
