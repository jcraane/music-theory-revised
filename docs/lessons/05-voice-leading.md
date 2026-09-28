# 05: Inversions and voice leading

**Status:** outlined
**Builds on:** 01

## Goal
Make progressions flow smoothly using inversions, common tones and small steps, and hear
the difference voicing makes to the same chords.

## Key concepts
- **Inversion:** a chord with a note other than the root in the bass (first, second inversion).
- **Slash chord:** notation for inversions and other bass notes (C/E, G/B).
- **Voice leading:** how each individual note moves from one chord to the next.
- **Common tone:** a note held over between chords.
- **Contrary motion:** voices moving in opposite directions.
- **Parallel fifths and octaves:** avoided in classical style, embraced in rock and EDM.

## Sections
1. **Inversions:** the same chord with a different bass note; hear the change in weight.
2. **Slash chords:** reading and writing C/E, G/B.
3. **Naive versus smooth:** a loop in root-position block chords, then with nearest voicings.
4. **Rules of thumb:** keep common tones, move other notes by the smallest step.
5. **Bass lines:** stepwise bass lines built from inversions (C–G/B–Am–F).
6. **Voice your own loop:** an auto-voice toggle on a user-built loop.

## Main experiment
Parallel fifths: hear why classical theory avoids them (voices lose independence) and why
power chords and planing use them on purpose. Rules are style-dependent.

## Quiz ideas
Name the inversion; pick the smoothest next voicing out of three.

## Components and theory
- **New:** voice-leading view (lines connecting notes between chords in a piano roll).
- **Theory:** `invert(chord, n)`, `voiceLead(prevVoicing, chord)`, `movementCost(a, b)`.

## Open questions
- Four-voice (SATB-like) or free voicings? Probably free voicings with an optional
  separate bass, to stay close to production practice.
