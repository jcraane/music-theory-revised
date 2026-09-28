// Multiple-choice quiz, one question at a time, with feedback and a play button after
// each answer. Questions come from `createQuestions()` ({ kind, prompt, options, answer,
// explanation, sound }); `playSound(sound)` returns a player handle; `onFinish(score, total)`
// returns { best, isNewBest } for the result screen.

import { h } from './dom.js';
import { createPlayButton } from './play-button.js';

export function renderQuiz(container, { createQuestions, playSound, onFinish }) {
  let questions = [];
  let index = 0;
  let score = 0;

  const root = h('div', { class: 'quiz' });
  container.append(root);

  function start() {
    questions = createQuestions();
    index = 0;
    score = 0;
    showQuestion();
  }

  function showQuestion() {
    const question = questions[index];
    const heading = h('h2', { class: 'quiz__prompt', tabindex: '-1' }, question.prompt);
    const feedback = h('div', { class: 'quiz__feedback', role: 'status' });

    const buttons = question.options.map((option, i) =>
      h('button', { type: 'button', class: 'button quiz__option', onclick: () => answer(i) }, option));

    function answer(choice) {
      const right = choice === question.answer;
      if (right) score += 1;
      buttons.forEach((button, i) => {
        button.disabled = true;
        if (i === question.answer) button.classList.add('is-correct');
        else if (i === choice) button.classList.add('is-wrong');
      });

      const last = index === questions.length - 1;
      const next = h('button', {
        type: 'button',
        class: 'button button--primary',
        onclick: () => {
          if (last) showResult();
          else {
            index += 1;
            showQuestion();
          }
        },
      }, last ? 'See your score' : 'Next question');

      feedback.replaceChildren(
        h('p', { class: `quiz__verdict ${right ? 'is-correct' : 'is-wrong'}` },
          right ? 'Correct.' : `Not quite. The answer is ${question.options[question.answer]}.`),
        h('p', {}, question.explanation),
        h('div', { class: 'button-row' },
          createPlayButton({ label: 'Hear it', primary: false, play: () => playSound(question.sound) }).element,
          next),
      );
      next.focus();
    }

    root.replaceChildren(
      h('p', { class: 'quiz__progress' }, `Question ${index + 1} of ${questions.length}`),
      heading,
      question.kind === 'ear'
        ? h('div', { class: 'button-row' }, createPlayButton({ label: 'Play the chord', shortcut: true, play: () => playSound(question.sound) }).element)
        : null,
      h('div', { class: 'quiz__options', role: 'group', 'aria-label': 'Answers' }, buttons),
      feedback,
    );
    heading.focus({ preventScroll: true });
  }

  function showResult() {
    const total = questions.length;
    const { best, isNewBest } = onFinish(score, total);
    const heading = h('h2', { class: 'quiz__prompt', tabindex: '-1' }, `You got ${score} of ${total} right.`);
    root.replaceChildren(
      heading,
      h('p', {}, isNewBest ? 'That\'s your best score so far.' : `Your best so far: ${best.score} of ${best.total}.`),
      h('p', {}, 'Every attempt asks new questions.'),
      h('div', { class: 'button-row' }, h('button', { type: 'button', class: 'button button--primary', onclick: start }, 'Try again')),
    );
    heading.focus({ preventScroll: true });
  }

  start();
}
