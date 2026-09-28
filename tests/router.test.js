import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseRoute, lessonHref, resumeSection, sectionNeighbors } from '../js/router.js';

const lesson = {
  id: 'keys-and-chords',
  sections: [{ id: 'one' }, { id: 'two' }, { id: 'three' }],
};

describe('parseRoute', () => {
  test('lesson list', () => {
    for (const hash of ['', '#', '#/']) assert.deepEqual(parseRoute(hash), { view: 'list' });
  });

  test('lesson without and with a section', () => {
    assert.deepEqual(parseRoute('#/lesson/keys-and-chords'), { view: 'lesson', lessonId: 'keys-and-chords', sectionId: null });
    assert.deepEqual(parseRoute('#/lesson/keys-and-chords/'), { view: 'lesson', lessonId: 'keys-and-chords', sectionId: null });
    assert.deepEqual(parseRoute('#/lesson/keys-and-chords/two'), { view: 'lesson', lessonId: 'keys-and-chords', sectionId: 'two' });
  });

  test('decodes escaped characters', () => {
    assert.equal(parseRoute('#/lesson/a%20b/c').lessonId, 'a b');
  });

  test('anything else is not found', () => {
    for (const hash of ['#/nope', '#/lesson', '#/lesson/a/b/c', '#lesson/a', '#/lesson/%E0%A4%A']) {
      assert.deepEqual(parseRoute(hash), { view: 'not-found' }, hash);
    }
  });
});

describe('lessonHref', () => {
  test('builds hashes that parseRoute reads back', () => {
    assert.equal(lessonHref('keys-and-chords'), '#/lesson/keys-and-chords');
    assert.equal(lessonHref('keys-and-chords', 'two'), '#/lesson/keys-and-chords/two');
    assert.equal(parseRoute(lessonHref('a b', 'c/d')).sectionId, 'c/d');
  });
});

describe('resumeSection', () => {
  test('first section that is not done', () => {
    assert.equal(resumeSection(lesson, []), 'one');
    assert.equal(resumeSection(lesson, ['one']), 'two');
    assert.equal(resumeSection(lesson, ['one', 'three']), 'two');
  });

  test('back to the start when everything is done', () => {
    assert.equal(resumeSection(lesson, ['one', 'two', 'three']), 'one');
  });
});

describe('sectionNeighbors', () => {
  test('previous and next sections', () => {
    assert.deepEqual(sectionNeighbors(lesson, 'one'), { index: 0, previous: null, next: lesson.sections[1] });
    assert.deepEqual(sectionNeighbors(lesson, 'two'), { index: 1, previous: lesson.sections[0], next: lesson.sections[2] });
    assert.deepEqual(sectionNeighbors(lesson, 'three'), { index: 2, previous: lesson.sections[1], next: null });
  });

  test('null for an unknown section', () => {
    assert.equal(sectionNeighbors(lesson, 'nope'), null);
  });
});
