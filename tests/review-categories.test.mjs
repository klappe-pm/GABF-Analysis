import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryGroups, feedbackDetails } from '../web/review/categories.mjs';

test('categories retain project additions and omit the redundant Other checkbox', () => {
  const groups = categoryGroups(['Bug', 'Layout', 'Other', 'Custom category']);
  assert.deepEqual(groups, [
    { key: 'change', categories: ['Bug'] },
    { key: 'appearance', categories: ['Layout'] },
    { key: 'additional', categories: ['Custom category'] },
  ]);
});

test('Other is selected by entered details and clears when those details are removed', () => {
  assert.deepEqual(feedbackDetails('Fix the title', 'More context', ['Bug']), { text: 'Fix the title\n\nOther details: More context', categories: ['Bug', 'Other'] });
  assert.deepEqual(feedbackDetails('Fix the title', '  ', ['Bug', 'Other']), { text: 'Fix the title', categories: ['Bug'] });
});
