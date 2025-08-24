import assert from 'assert';
import { toString, generate } from '../index.js';
import test from 'node:test';

test('generate matrix for text', () => {
  const matrix = generate('HELLO');
  assert.strictEqual(matrix.length, 21);
  assert.strictEqual(matrix[0].length, 21);
});

test('string output has expected dimensions', () => {
  const str = toString('HELLO');
  const lines = str.split('\n');
  assert.strictEqual(lines.length, 21);
  assert.ok(lines.every(l => l.length === 42));
});
