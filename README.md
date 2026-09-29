# music-theory-revised

Chord Lab: an interactive way to learn how chords and chord progressions work.
Every concept is heard first, then seen, then explained.

## Run locally
Tooling is managed with [mise](https://mise.jdx.dev). Install the pinned tools once:
```
mise install
```
Then serve the app:
```
mise run serve
```
Then open the printed URL. ES modules need a local server; opening index.html directly won't work.

## Tests
```
mise run test
```

See PLAN.md for the plan and roadmap.

## Credits
Music glyphs (clef, noteheads, accidentals) are taken from the Bravura font by Steinberg
Media Technologies, under the SIL Open Font License; see `licenses/OFL-bravura-glyphs.txt`.
