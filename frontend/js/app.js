import { validateInput, convert } from './converter.js';
import { signUp, signIn, signOut, getCurrentUser, onAuthChange } from './auth.js';
import { saveConversion, fetchHistory, clearHistory } from './history.js';

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
  if (user) {
    userEmailEl.textContent = user.email;
    renderHistory();
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  authError.textContent = '';
  try {
    await signIn(emailInput.value, passwordInput.value);
  } catch (err) {
    authError.textContent = err.message;
  }
});

document.getElementById('sign-up').addEventListener('click', async () => {
  authError.textContent = '';
  if (!emailInput.checkValidity() || !passwordInput.checkValidity()) {
    authError.textContent = 'Enter a valid email and a password of at least 6 characters.';
    return;
  }
  try {
    await signUp(emailInput.value, passwordInput.value);
    authError.textContent = 'Check your email to confirm your account, then sign in.';
  } catch (err) {
    authError.textContent = err.message;
  }
});

document.getElementById('sign-out').addEventListener('click', async () => {
  await signOut();
});

onAuthChange(renderAuthState);
getCurrentUser().then(renderAuthState);

// ---- History ----

const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');

async function renderHistory() {
  const rows = await fetchHistory();
  historyList.innerHTML = '';
  historyEmpty.hidden = rows.length > 0;

  for (const row of rows) {
    const li = document.createElement('li');
    const when = new Date(row.created_at).toLocaleString();
    li.textContent = `${row.input_value} ${row.input_unit} = ${row.output_value} ${row.output_unit} — ${when}`;
    historyList.appendChild(li);
  }
}

document.getElementById('clear-history').addEventListener('click', async () => {
  await clearHistory();
  await renderHistory();
});
