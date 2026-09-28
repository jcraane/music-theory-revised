# CLAUDE.md

Chord Lab is a personal web app for learning chords and chord progressions.
The full plan, module specs and milestones are in PLAN.md. Read it before starting work.
Lesson content is specified in docs/: docs/curriculum.md for the overview and
docs/lessons/NN-name.md for each lesson. Implement lessons from their spec file.
Only lessons with status "specified" are ready to implement; "outlined" lessons are
not, but read them when making architecture decisions so later lessons stay possible.

## How to run
- Tooling is managed with mise (`mise.toml` pins Node and serve). Run `mise install` once.
- Serve locally: `mise run serve`, then open the printed URL.
- Tests: `mise run test` (Node's built-in test runner, no dependencies).

## Conventions
- Plain HTML, CSS and JavaScript with ES modules. No frameworks, no build tools,
  and no new dependencies without asking first.
- Small, focused modules. Theory functions stay pure and are covered by unit tests.
- Correct note spelling per key (each letter once) is a hard requirement.
- Audio only starts after a user gesture; stopping fades out instead of clicking.
- UI copy in sentence case, short and plain.
- Accessibility baseline: keyboard operable, visible focus, prefers-reduced-motion respected.
- Colors and spacing come from CSS custom properties in css/tokens.css; support light and dark.

## Workflow
- Work one milestone from PLAN.md at a time and stop for review after each.
- For theory work, write the tests first.
- End each milestone with a short manual test checklist.
- When a lesson is implemented, set its status to "built" in docs/curriculum.md and in
  the lesson file.
- If implementation reveals a gap or conflict in a lesson spec, ask instead of guessing,
  and update the spec once decided.
