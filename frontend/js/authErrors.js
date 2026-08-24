// Maps a handful of known Supabase Auth error strings to plain-language copy. Pure and
// DOM-free like converter.js, for the same reason: so it can be unit tested directly.

const AUTH_ERROR_MESSAGES = {
  'email rate limit exceeded': 'Too many sign-up emails sent recently — please try again in a bit.',
  'Invalid login credentials': 'That email and password combination doesn’t match an account.',
  'User already registered': 'An account with that email already exists — try signing in instead.',
};

export function friendlyAuthError(err) {
  return AUTH_ERROR_MESSAGES[err.message] ?? err.message;
}
