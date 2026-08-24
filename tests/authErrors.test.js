// Run with: node --test tests/authErrors.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import { friendlyAuthError } from '../frontend/js/authErrors.js';

test('maps known Supabase error messages to plain-language copy', () => {
  assert.equal(
    friendlyAuthError(new Error('Invalid login credentials')),
    'That email and password combination doesn’t match an account.'
  );
  assert.equal(
    friendlyAuthError(new Error('User already registered')),
    'An account with that email already exists — try signing in instead.'
  );
  assert.equal(
    friendlyAuthError(new Error('email rate limit exceeded')),
    'Too many sign-up emails sent recently — please try again in a bit.'
  );
});

test('falls back to the original message for anything unmapped', () => {
  assert.equal(
    friendlyAuthError(new Error('Some new Supabase error string')),
    'Some new Supabase error string'
  );
});
