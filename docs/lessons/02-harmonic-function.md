# 02: Harmonic function: home, away, tension

**Status:** outlined
**Builds on:** 01

## Goal
Hear the three roles chords play in a key (home, away, tension) and predict how a chord
wants to move next.

## Key concepts
- **Tonic:** the home chord (I), plus its stand-ins iii and vi.
- **Subdominant (predominant):** chords that move away from home (IV, ii).
- **Dominant:** chords that create tension towards home (V, vii°).
- **Leading tone:** the 7th scale degree, a half step below the tonic, which wants to rise.
- **Tritone:** the unstable 6-semitone interval inside vii° (and V7), resolving inward.
- **Function families:** chords in the same family can often replace each other.

## Sections
1. **Home and away:** the same loop ending on I, then on V. Resolved versus hanging.
2. **The three families:** chord cards grouped and colored by function; swap vi in for I
   and hear the family resemblance.
3. **Why V pulls:** the leading tone rising to the tonic; the tritone in vii° resolving
   inward. A zoomed-in two-voice view of the resolution.
4. **The usual flow:** tonic → subdominant → dominant → tonic as the "grammar" of many
   progressions. Build a loop; each chord gets its function color. (Reuse the four-chord
   loop builder that was moved out of lesson 01 sections 3 and 5: `js/ui/loop-builder.js`.
   Decide whether it stays an option of lesson 01's chord board or moves elsewhere.)
5. **Seeing tension:** the tension meter rises and falls as a loop plays.
6. **Function in minor, a preview:** the minor v has no leading tone, so it pulls weakly.
   (Resolved properly in lesson 07.)

## Main experiment
Reverse the flow: T → D → S → T (I–V–IV–I). It sounds looser and "rock", not wrong.
Function explains tendencies, not laws.

## Quiz ideas
Name the function of a chord in a given key; ear: does this loop end resolved or hanging?

## Components and theory
- **New:** tension meter; function coloring on chord cards.
- **Theory:** `functionOf(degree, mode)`; a simple tension model per chord.

## Open questions
- How to compute tension: function weights only, or also dissonance and position in
  the phrase? Keep it explainable.
- Should the sequence player's step events carry chord and function info from now on?
  (Architecture decision for Claude Code, ideally before lesson 02.)
