// Pure conversion logic — no DOM access here, so it can be unit tested directly (see /tests).

export const KM_PER_MILE = 1.609344;

/**
 * Validate raw user input for the converter.
 * Returns { valid: true, value: number } or { valid: false, error: string }.
 */
export function validateInput(raw) {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { valid: false, error: 'Enter a number.' };
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    return { valid: false, error: 'Enter a valid finite number.' };
  }

  if (value < 0) {
    return { valid: false, error: 'Distance cannot be negative.' };
  }

  return { valid: true, value };
}

function round(value) {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Convert a validated numeric value between km and mi.
 * direction: 'km-to-mi' | 'mi-to-km'
 */
export function convert(value, direction) {
  if (direction === 'km-to-mi') {
    return {
      inputUnit: 'km',
      outputUnit: 'mi',
      outputValue: round(value / KM_PER_MILE),
    };
  }

  if (direction === 'mi-to-km') {
    return {
      inputUnit: 'mi',
      outputUnit: 'km',
      outputValue: round(value * KM_PER_MILE),
    };
  }

  throw new Error(`Unknown conversion direction: ${direction}`);
}
