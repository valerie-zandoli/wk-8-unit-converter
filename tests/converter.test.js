// Run with: node --test tests/converter.test.js
// No dependencies (uses Node's built-in test runner + assert) — nothing to install.

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInput, convert, KM_PER_MILE } from '../frontend/js/converter.js';

test('validateInput rejects empty input', () => {
  assert.equal(validateInput('').valid, false);
  assert.equal(validateInput(null).valid, false);
  assert.equal(validateInput(undefined).valid, false);
  assert.equal(validateInput('   ').valid, false);
});

test('validateInput rejects non-numeric input', () => {
  assert.equal(validateInput('abc').valid, false);
  assert.equal(validateInput('12abc').valid, false);
  assert.equal(validateInput('NaN').valid, false);
});

test('validateInput rejects negative and infinite input', () => {
  assert.equal(validateInput(-5).valid, false);
  assert.equal(validateInput('Infinity').valid, false);
});

test('validateInput accepts zero and positive numbers, including strings', () => {
  assert.equal(validateInput(0).valid, true);
  assert.equal(validateInput('42').valid, true);
  assert.equal(validateInput('3.14').valid, true);
});

test('convert km-to-mi matches known reference value', () => {
  const result = convert(10, 'km-to-mi');
  assert.equal(result.outputUnit, 'mi');
  assert.equal(result.outputValue, 6.213712);
});

test('convert mi-to-km matches known reference value', () => {
  const result = convert(10, 'mi-to-km');
  assert.equal(result.outputUnit, 'km');
  assert.equal(result.outputValue, 16.09344);
});

test('convert round-trips back to (approximately) the original value', () => {
  const toMiles = convert(100, 'km-to-mi');
  const backToKm = convert(toMiles.outputValue, 'mi-to-km');
  assert.ok(Math.abs(backToKm.outputValue - 100) < 1e-4);
});

test('convert throws on an unknown direction', () => {
  assert.throws(() => convert(10, 'lightyears-to-km'));
});

test('KM_PER_MILE constant is the standard conversion factor', () => {
  assert.equal(KM_PER_MILE, 1.609344);
});
