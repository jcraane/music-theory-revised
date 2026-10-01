# 03: Cadences: how phrases end

**Status:** specified
**Builds on:** 02
**Estimated sections:** 8

## Goal
Hear how the last two chords of a phrase decide what it means, recognize authentic,
plagal, half and deceptive cadences by ear, and know the typical minor-key ending.

## Key concepts
- **Phrase:** a musical sentence, usually 4 or 8 bars, with a melody that rises and comes
  to rest.
- **Cadence:** the chord move that ends a phrase, like punctuation at the end of a sentence.
- **Authentic cadence (V–I):** a full stop. The strongest ending.
- **Plagal cadence (IV–I):** a softer full stop, the "amen" ending.
- **Half cadence (ends on V):** a comma or a question. Any chord moving to V; the next
  phrase usually answers it.
- **Deceptive cadence (V–vi):** the ear expects home and gets a stand-in, so the phrase
  has to keep going.
- **Question and answer:** a phrase ending on a half cadence followed by one ending on an
  authentic cadence. Classical theory calls this pair a period.
- **Aeolian cadence (VI–VII–i):** the typical minor-key ending in rock, film and trance,
  without a leading tone.

## Phrases in this lesson
Every example is a 4-bar phrase in 4/4: one chord per bar, plus a simple melody on top.
The first two bars are the opening, the last two the ending, so the same opening can
take any ending. Melodies are written as scale degrees (1 is the tonic, 6 the 6th note of
the scale) with their length in beats; the C major and A minor notes are given to check
against.

| Part | Chords | Melody (degree:beats) | In C major / A minor |
|------|--------|-----------------------|----------------------|
| Opening A | I, vi | 1:1 3:1 5:2 \| 6:1 5:1 3:2 | C E G \| A G E |
| Opening B | I, ii | 5:1 3:1 1:2 \| 2:1 4:1 6:2 | G E C \| D F A |
| Authentic ending | V, I | 5:1 4:1 2:2 \| 1:4 | G F D \| C |
| Plagal ending | IV, I | 6:1 4:1 1:2 \| 1:4 | A F C \| C |
| Half ending | IV, V | 6:1 4:1 1:2 \| 2:4 | A F C \| D |
| Deceptive ending | V, vi | 5:1 4:1 2:2 \| 1:4 | G F D \| C |
| Extension (section 5) | IV, V, I | 6:1 4:1 1:2 \| 5:1 4:1 2:2 \| 1:4 | A F C \| G F D \| C |
| Minor opening | i, VI | 1:1 3:1 5:2 \| 6:1 5:1 3:2 | A C E \| F E C |
| Minor endings | VII, i / v, i / V, i | 5:1 4:1 2:2 \| 1:4 | E D B \| A |

The pairs are deliberate: authentic and deceptive share bar 3 and the whole melody, so
only the last chord differs; plagal and half share bar 3, so only the last bar differs.
The three minor endings share their melody too; it avoids the 7th, so V's raised 7th
(G♯ in A minor) never clashes with it.

Voicing, so the melody always sits on top:
- The melody tonic is the key's tonic one octave above the lesson 01 voicing
  (`keyOctave(tonic) + 1`): C5 in C major, G4 in G major, A4 in A minor. Melody notes go
  up from there, at most to degree 6.
- Each chord is a root-position triad, placed as high as it can go while its top note
  stays below the melody tonic. In C major: I is C4 E4 G4, ii D4 F4 A4, IV F3 A3 C4,
  V G3 B3 D4, vi A3 C4 E4. In A minor: i is A3 C4 E4, VI F3 A3 C4, VII G3 B3 D4,
  v E3 G3 B3, V E3 G♯3 B3.
- Everything fits a four-octave piano from C3 (MIDI 48 to 95) in every key the selectors
  offer.
- Chords play at velocity 0.55 and ring for the whole bar; melody notes play at 0.9.

Tempo is 96 BPM throughout, so a phrase lasts 10 seconds. "Play" loops a phrase with one
bar of rest between repeats, so each ending is heard as an ending. A change made while a
phrase loops takes effect when the phrase starts again, never halfway through it.

## Sections

### 1. Phrases as sentences
- **Hear:** an 8-bar question and answer in C major: opening A with the half ending
  (I–vi–IV–V), then opening A with the authentic ending (I–vi–V–I). No rest between them.
- **See:** two phrase strips, one per line, labeled "Question" and "Answer". Each bar
  shows the numeral, the chord name and the function color from lesson 02. After the last
  bar of each strip sits its punctuation: "?" after the question, "." after the answer. As
  the music plays, the bar that sounds highlights, and the piano shows the chord in role
  colors with the melody note in the melody color.
- **Read:** "Music is made of phrases, like speech is made of sentences. A phrase is
  usually 4 or 8 bars long: a melody that rises, moves around and comes to rest. How it
  comes to rest depends mostly on its last two chords. That ending is called a cadence,
  and it works like punctuation. Some cadences are a full stop. Others are a comma or a
  question mark: they make you wait for the next phrase."
  Second paragraph: "Listen to the two phrases. They start the same way. The first ends on
  V and asks a question; the second ends on I and answers it."
- **Try:** buttons "Play the question" and "Play the answer", and one toggle, "Answer
  first". With the toggle on, Listen plays the answer, then the question, and the strips
  swap places. Explanation shown when the toggle is on: "Same chords, same melody, but
  now the music stops on the question. It sounds unfinished, because it is." C major only.

### 2. Authentic: the full stop
- **Hear:** opening A with the authentic ending in C major (I–vi–V–I), a bar of rest, then
  V–I alone, two beats per chord.
- **See:** one phrase strip with a bracket under bars 3 and 4: "Authentic cadence: V–I",
  and "." after the last bar. When V sounds, the piano labels its third as the leading
  tone, with a bracket to the tonic above it ("B to C: half step"), as in lesson 02.
- **Read:** "V–I is the authentic cadence: the strongest way to end a phrase. Everything
  from lesson 02 comes together here. V is the chord of most tension, its leading tone
  slides up into the tonic, and the bass falls home from the 5th degree to the 1st.
  The ear hears a full stop."
  Second paragraph: "The melody helps. Here it steps down from 2 to 1, D to C, landing on
  the tonic exactly when the chord does."
- **Try:** pick any major key. Buttons "Play the phrase" and "Play V–I". Toggle "Melody"
  (on by default) for the phrase. Explanation shown when the melody is off: "Without the
  melody, V–I still ends the phrase: the cadence lives in the chords. The melody makes it
  firmer, but it doesn't make it."

### 3. Plagal: the amen
- **Hear:** opening A with the plagal ending in C major (I–vi–IV–I), a bar of rest, then
  IV–I alone and V–I alone, two beats per chord.
- **See:** the phrase strip with "Plagal cadence: IV–I" under bars 3 and 4 and "." at the
  end. On the piano, a bracket marks the tonic note inside IV ("C in both chords") when
  IV–I plays: the note that stays while the others move.
- **Read:** "IV–I is the plagal cadence. It ends the phrase too, but softly. IV has no
  leading tone, so nothing pulls hard towards home. Instead IV already contains the tonic,
  C in C major, and simply settles into I around it. It's the 'amen' at the end of a
  hymn, and the warm ending of many gospel, pop and rock songs."
  Second paragraph: "Compare the two full stops: V–I is a firm statement, IV–I a nod."
- **Try:** pick any major key. A choice group "Ending": "V–I" and "IV–I". Play loops the
  phrase; switching takes effect when the phrase starts again. The bracket and the
  piano's common-tone label follow the choice.

### 4. Half cadence: the question
- **Hear:** opening A with the half ending in C major (I–vi–IV–V), a bar of rest.
- **See:** the phrase strip with "Half cadence: ends on V" under bars 3 and 4 and "?" at
  the end.
- **Read:** "End a phrase on V and you get a half cadence. The tension is built but never
  released, so the phrase sounds like a question, or a comma: the sentence isn't over.
  A half cadence is named only by where it lands. Any chord can lead to V: I, ii, IV. What
  makes it a half cadence is stopping there."
  Second paragraph: "Composers rarely leave the question hanging. The next phrase usually
  starts again and ends on I, which is the question and answer from section 1."
- **Try:** a choice group "Chord before V": I, ii and IV (IV by default). Bar 3 changes
  to that chord with its own melody (I: 3:1 2:1 1:2, E D C; ii: 6:1 4:1 2:2, A F D;
  IV: 6:1 4:1 1:2, A F C); bar 4 stays V with melody 2:4. The bracket reads "Half
  cadence: I–V", "ii–V" or "IV–V". Play loops the phrase. A button "Answer it" plays the
  current phrase once, then opening A with the authentic ending. C major only.

### 5. Deceptive: the surprise
- **Hear:** opening A with the authentic ending in C major, a bar of rest, then opening A
  with the deceptive ending (I–vi–V–vi).
- **See:** the phrase strip with "Deceptive cadence: V–vi" under bars 3 and 4 and "…" at
  the end. When vi sounds, the piano marks the two notes it shares with I, as in lesson
  02 section 2 ("shared with I"), and the melody note on top of both is the tonic.
- **Read:** "Same chords, same melody, until the very last chord. V sets up home, the
  melody even lands on the tonic, but underneath it the bass steps up to vi instead of
  falling to I. That's the deceptive cadence. vi is a stand-in for I: it shares two of its
  three notes, so the ending sounds related to home, but darker, and not finished."
  Second paragraph: "A deceptive cadence doesn't end a phrase; it extends it. The music
  has to try again, and usually finds its way home a few bars later."
- **Try:** pick any major key. A choice group "Ending": "V–I" and "V–vi". With "V–vi"
  chosen, a toggle "Keep going" appears: it adds the 3-bar extension (IV–V–I) after vi,
  so the phrase becomes 7 bars that end with an authentic cadence. The strip grows to
  7 bars, with the deceptive bracket under bars 3–4 and an authentic bracket under bars
  6–7. Play loops the phrase.

### 6. Cadences in minor
- **Hear:** in A minor, the minor opening with each ending in turn, a bar of rest between:
  VII–i (i–VI–VII–i), v–i (i–VI–v–i), V–i (i–VI–V–i).
- **See:** the phrase strip in minor, with a bracket under bars 2–4 for VII–i ("Aeolian
  cadence: VI–VII–i") or under bars 3–4 for the others ("Authentic cadence: v–i, no
  leading tone" and "Authentic cadence: V–i"). v and VII carry the weak dominant
  treatment from lesson 02; V is a normal dominant. On the piano, a bracket under the keys
  marks the step from the 7th to the tonic while the dominant sounds: "G to A: whole step"
  for v and VII, "G♯ to A: half step" for V.
- **Read:** "Minor keys end phrases their own way. Natural minor's v has no leading tone,
  so v–i sounds soft, more of a sigh than a full stop. Classical composers raise the 7th
  to get a major V (E major in A minor) and a real authentic cadence. Lesson 07 shows how."
  Second paragraph: "Rock, film and trance often skip the leading tone altogether and end
  on VI–VII–i: F–G–Am in A minor. The bass climbs two whole steps into the tonic. This is
  the Aeolian cadence, named after the old name for natural minor. It doesn't pull, it
  arrives: open, epic and a little defiant."
- **Try:** pick any minor key. A choice group "Ending": "VI–VII–i", "v–i" and "V–i".
  Play loops the phrase; switching takes effect when the phrase starts again.

### 7. Experiment: one phrase, four endings
- **Hear:** opening A in C major with the authentic ending, a bar of rest, then with the
  deceptive ending.
- **See:** one phrase strip with the cadence bracket and punctuation of the chosen ending,
  and below it a short line saying what the ending did. The piano follows the music.
- **Read (before):** "You know four ways to end a phrase. Keep the opening, change only
  the ending, and listen to how the whole phrase changes meaning."
- **Try:** pick any major key. A choice group "Ending": "Authentic", "Plagal", "Half" and
  "Deceptive", and the "Melody" toggle from section 2. Play loops the phrase; switching
  takes effect when the phrase starts again. The line under the strip, per ending:
  - Authentic: "V–I. A full stop: the phrase is over."
  - Plagal: "IV–I. A softer full stop, like an amen."
  - Half: "IV–V. A question: the phrase waits for an answer."
  - Deceptive: "V–vi. A surprise: home was promised, a stand-in arrived, and the music
    has to go on."
  Explanation shown after the user has heard all four: "The first two bars never changed.
  Yet each ending made you hear them differently: as the start of a statement, a
  question or a story that isn't over. That's why cadences matter more than any other
  chords in a phrase."

### 8. Check yourself
See the quiz section below.

## Experiments
Section 7 is the main experiment. Smaller ones earlier:
- Section 1: put the answer first and hear the music stop on a question.
- Section 2: turn the melody off and hear that V–I still ends the phrase.
- Section 4: change the chord before V and hear that every version still asks a question.
- Section 5: let the phrase keep going after the deceptive cadence until it finds home.

## Quiz
Eight questions per attempt, generated from the theory engine so each attempt differs.
- **Ear (4 questions):** "How does this phrase end?" A 4-bar phrase with melody plays in
  a random major key, with opening A or B (random) and one of the four endings. Each
  ending appears exactly once per attempt, in random order. Options: Authentic, Plagal,
  Half, Deceptive. Replay allowed.
- **Theory (4 questions),** one of each with random keys:
  - "What kind of cadence is [chord]–[chord] in [key]?", with chord names (for example
    "G–C in C major"). The pair is V–I, IV–I, I–V, ii–V, IV–V or V–vi, checked with
    `cadenceType`. Options: Authentic, Plagal, Half, Deceptive.
  - "A half cadence ends on which chord in [key]?" Right: V. Wrong: I, IV and vi.
  - "In a deceptive cadence in [key], V moves to which chord?" Right: vi. Wrong: I, IV
    and ii.
  - "Which ending is the Aeolian cadence in [minor key]?", with options as chord names.
    Right: VI–VII–i (F–G–Am). Wrong: iv–v–i (Dm–Em–Am), VII–VI–i (G–F–Am) and VI–v–i
    (F–Em–Am).
- Show the correct answer with a short explanation and a play button after each answer.
  Ear questions replay the phrase, and the explanation names its last two chords ("It
  ended IV–V: a half cadence"). Theory questions play the chords they name. Store the
  best score in storage.

## Genre connections
- **Classical:** phrases in question and answer pairs, half cadence then authentic; the
  deceptive cadence to stretch a phrase before the final V–I.
- **Pop:** half cadences at the end of a pre-chorus, so the chorus lands as the answer;
  IV–I endings in ballads; V–vi to delay the last chorus.
- **Gospel and soul:** the plagal "amen" ending, often stretched out over several bars.
- **Rock:** IV–I and VI–VII–i endings far more often than V–I.
- **Jazz:** ii–V–I as the standard authentic cadence, at the end of almost every phrase.
- **Trance, EDM and film:** VI–VII–i as the minor-key ending; loops that avoid a full
  cadence so the music never quite stops.

## Components and theory functions
- **Existing components:** piano, chord card styles and function colors, role legend,
  key selector, choice group, play button, quiz, sequence player.
- **New components:**
  - Phrase player: plays a phrase (chords plus a top line) and shows it on a phrase
    strip and the piano. The strip shows one bar per chord with the numeral, chord name
    and function color (family named as text), a labeled cadence bracket under the last
    two or three bars, and the punctuation mark after the last bar. The bar that sounds
    highlights. Reusable by later lessons that need music with a melody (lesson 09).
  - A "melody" highlight role on the piano, with a token per theme in css/tokens.css and
    an entry in the role legend.
- **Audio change:** a note in a step's `notes` can be a MIDI number or `{ midi, beats,
  velocity }`. `beats` sets how long that note rings and may be longer than the step,
  so a phrase is one step per melody note, with the chord's notes on the first step of
  each bar ringing for four beats. Turning a step into scheduled notes is a pure helper
  in `scheduler.js`, unit-tested. Sequences that use plain numbers sound the same as now.
- **New theory functions,** tests first:
  - `cadenceType(from, to, mode)` in `harmony.js`, with scale degrees 1–7 → "authentic",
    "plagal", "half", "deceptive", "aeolian" or null. Major: 5→1 authentic, 4→1 plagal,
    any other degree → 5 half, 5→6 deceptive, everything else null. Minor: the same, plus
    7→1 aeolian. Tests: C major V–I, IV–I, I–V, ii–V, IV–V, vi–V, V–vi; null for vi–I,
    ii–I, vii°–I and V–V; A minor v–i authentic, iv–i plagal, iv–v half, v–VI deceptive,
    VII–i aeolian; major 7→1 is null, not aeolian; invalid degrees and modes throw.
  - `phraseSteps(phrase, tonic, mode, { melody })` in `js/lessons/common/phrase.js`
    (pure): spells the melody from the key's scale, voices the chords as described above
    and returns the steps for `playSequence`, each with its bar, chord and melody note
    attached. A chord can be `{ degree, quality }` to override the diatonic quality (V in
    minor). Tests: C major opening A melody is C5 E5 G5 A5 G5 E5; G major spells F♯;
    every chord's top note is below the melody tonic in every major and minor key the
    selectors offer; V in A minor is E G♯ B; bars add up to 4 beats; with melody off, the
    steps carry chord notes only.
- **Architecture decisions:**
  - The phrase data (openings, endings, extension) lives in the lesson's folder as plain
    data; `phraseSteps` and the phrase player live in `js/lessons/common/` and
    `js/ui/` so later lessons can use them.
  - The cadence label for V in minor is set by the section, not by `functionOf`: V is a
    normal dominant here, and lesson 07 decides how `functionOf` treats it.

## Implementation decisions
Carried over from lessons 01 and 02:
- Nothing plays on arrival: each section starts with a Listen button, and the visual
  shows its finished state before listening.
- Key selectors offer the same 12 major keys (and their relative minors) as lesson 01.
  Sections 2, 3, 5 and 7 have a major key selector, section 6 a minor one; the others
  stay in C major.
- Chords are colored by function, with the family named as text.

Decided while specifying:
- Phrases are 4 bars with one chord per bar, so an ending is always exactly two bars.
  Only section 1 (the question and answer) and section 5 (the extension) are longer.
- Melodies are written by hand as scale degrees, not generated from the voicing: a
  generated top line would follow the chords instead of leading them, and the endings
  need specific melody notes (2–1 over V–I, the tonic over vi).
- `cadenceType` looks at two chords. VI–VII–i is named by its last move, VII–i; the
  lesson always shows it with VI before it.
- v–i counts as authentic, marked as having no leading tone, in line with lesson 02's
  weak dominant. vii°–I gets no name in this lesson.
- At rest, the piano shows the last chord and the last melody note of the phrase.

## Out of scope
- Perfect versus imperfect authentic cadences (which melody note ends on top, inversions).
- The Phrygian half cadence, the cadential 6/4 and other classical refinements.
- V7–I and other 7th chords at cadences (lesson 06).
- Harmonic minor and how the major V in minor is built (lesson 07; section 6 only lets
  you hear it).
- bVI–bVII–I in major, the borrowed version of the Aeolian ending (lesson 08).
- Melody notation on the staff.
