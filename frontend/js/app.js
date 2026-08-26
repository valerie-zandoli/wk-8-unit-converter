import { validateInput, convert } from './converter.js';
import { signUp, signIn, signOut, getCurrentUser, onAuthChange } from './auth.js';
import { saveConversion, fetchHistory, clearHistory, deleteConversion } from './history.js';
import { friendlyAuthError } from './authErrors.js';

// ---- Converter ----

const converterForm = document.getElementById('converter-form');
const valueInput = document.getElementById('value');
const valueError = document.getElementById('value-error');
const directionSelect = document.getElementById('direction');
const result = document.getElementById('result');

converterForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  valueError.textContent = '';

  const check = validateInput(valueInput.value);
  if (!check.valid) {
    valueError.textContent = check.error;
    result.textContent = '';
    return;
  }

  const { inputUnit, outputUnit, outputValue } = convert(check.value, directionSelect.value);
  result.textContent = `${check.value} ${inputUnit} = ${outputValue} ${outputUnit}`;

  try {
    const saved = await saveConversion({
      inputValue: check.value,
      inputUnit,
      outputValue,
      outputUnit,
    });
    if (saved) await renderHistory();
  } catch (err) {
    console.error('Could not save conversion history:', err.message);
  }
});

// ---- Auth ----

const signedOutView = document.getElementById('signed-out-view');
const signedInView = document.getElementById('signed-in-view');
const userEmailEl = document.getElementById('user-email');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const historyCard = document.getElementById('history-card');

function renderAuthState(user) {
  signedOutView.hidden = Boolean(user);
  signedInView.hidden = !user;
  historyCard.hidden = !user;
  // Clear synchronously on every auth change, before the next renderHistory() fetch
  // resolves — otherwise the previous user's rows sit in the DOM, visible, for the
  // duration of that network round trip if a different user signs in right after.
  historyList.innerHTML = '';
  historyEmpty.hidden = true;
  if (user) {
    userEmailEl.textContent = user.email;
    renderHistory();
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.textContent = '';
  passwordInput.autocomplete = 'current-password';
  try {
    await signIn(emailInput.value, passwordInput.value);
  } catch (err) {
    authError.textContent = friendlyAuthError(err);
  }
});

document.getElementById('sign-up').addEventListener('click', async () => {
  authError.textContent = '';
  passwordInput.autocomplete = 'new-password';
  if (!emailInput.checkValidity() || !passwordInput.checkValidity()) {
    authError.textContent = 'Enter a valid email and a password of at least 6 characters.';
    return;
  }
  try {
    await signUp(emailInput.value, passwordInput.value);
    authError.textContent = 'Check your email to confirm your account, then sign in.';
  } catch (err) {
    authError.textContent = friendlyAuthError(err);
  }
});

document.getElementById('sign-out').addEventListener('click', async () => {
  try {
    await signOut();
  } catch (err) {
    console.error('Could not sign out:', err.message);
  }
});

onAuthChange(renderAuthState);
getCurrentUser().then(renderAuthState);

// ---- History ----

const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');

async function renderHistory() {
  let rows;
  try {
    rows = await fetchHistory();
  } catch (err) {
    console.error('Could not load conversion history:', err.message);
    return;
  }

  historyList.innerHTML = '';
  historyEmpty.hidden = rows.length > 0;

  for (const row of rows) {
    const li = document.createElement('li');
    li.dataset.id = row.id;

    const text = document.createElement('span');
    const when = new Date(row.created_at).toLocaleString();
    text.textContent = `${row.input_value} ${row.input_unit} = ${row.output_value} ${row.output_unit} — ${when}`;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'history-delete';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete this conversion: ${text.textContent}`);

    li.append(text, deleteButton);
    historyList.appendChild(li);
  }
}

historyList.addEventListener('click', async (event) => {
  if (!event.target.classList.contains('history-delete')) return;
  const id = event.target.closest('li').dataset.id;
  try {
    await deleteConversion(id);
  } catch (err) {
    console.error('Could not delete conversion:', err.message);
    return;
  }
  await renderHistory();
});

document.getElementById('clear-history').addEventListener('click', async () => {
  if (!window.confirm('Clear your entire conversion history? This cannot be undone.')) return;
  try {
    await clearHistory();
  } catch (err) {
    console.error('Could not clear conversion history:', err.message);
    return;
  }
  await renderHistory();
});
