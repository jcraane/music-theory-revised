// Section 8: the quiz. Four ear questions (home or hanging) and four about function, new
// every attempt.

import { h } from '../../ui/dom.js';
import { renderQuiz } from '../../ui/quiz.js';
import { diatonicChords } from '../../theory/chords.js';
import { createQuestions } from './quiz-questions.js';
import { voiceKeyChords, play, midis } from '../common/shared.js';

export default {
  id: 'check-yourself',
  title: 'Check yourself',
  render(container, ctx) {
    container.append(h('p', {}, 'Eight questions: four by ear, four about the three families. You can replay a progression as often as you like.'));

    renderQuiz(container, {
      createQuestions: () => createQuestions(),
      // Chords are voiced with roots rising from the tonic, as in the lesson; ear questions
      // use the keys sound, whatever instrument is set.
      playSound: ({ tonic, degrees }) => {
        const voicings = voiceKeyChords(tonic, 'major', diatonicChords(tonic, 'major'));
        return play(ctx, degrees.map((degree) => ({ notes: midis(voicings[degree - 1]), beats: 2 })), { bpm: 90, instrument: 'keys' });
      },
      onFinish: (score, total) => {
        const isNewBest = ctx.storage.recordScore(ctx.lesson.id, score, total);
        ctx.complete();
        return { best: ctx.storage.bestScore(ctx.lesson.id), isNewBest };
      },
    });
  },
};
