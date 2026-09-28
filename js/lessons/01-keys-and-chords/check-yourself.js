// Section 7: the quiz. Four ear questions and four theory questions, new every attempt.

import { h } from '../../ui/dom.js';
import { renderQuiz } from '../../ui/quiz.js';
import { createQuestions } from './quiz-questions.js';
import { voice, play, midis } from './shared.js';

export default {
  id: 'check-yourself',
  title: 'Check yourself',
  render(container, ctx) {
    container.append(h('p', {}, 'Eight questions: four by ear, four about keys and chords. You can replay the chord as often as you like.'));

    renderQuiz(container, {
      createQuestions: () => createQuestions(),
      // Ear questions use the keys sound, whatever instrument is set.
      playSound: (sound) => play(ctx, sound.map((notes) => ({ notes: midis(voice(notes)), beats: 2 })), { bpm: 90, instrument: 'keys' }),
      onFinish: (score, total) => {
        const isNewBest = ctx.storage.recordScore(ctx.lesson.id, score, total);
        ctx.complete();
        return { best: ctx.storage.bestScore(ctx.lesson.id), isNewBest };
      },
    });
  },
};
