import { supabase } from './supabaseClient.js';

// RLS on the `conversions` table guarantees these calls only ever touch the signed-in
// user's own rows — no user_id filtering needed client-side, and none would be trustworthy
// anyway since it's client code.

export async function saveConversion({ inputValue, inputUnit, outputValue, outputUnit }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // not signed in — history is opt-in, conversion still works locally

  const { error } = await supabase.from('conversions').insert({
    user_id: user.id,
    input_value: inputValue,
    input_unit: inputUnit,
    output_value: outputValue,
    output_unit: outputUnit,
  });
  if (error) throw error;
  return true;
}

export async function fetchHistory() {
  const { data, error } = await supabase
    .from('conversions')
    .select('id, input_value, input_unit, output_value, output_unit, created_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function clearHistory() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('conversions').delete().eq('user_id', user.id);
  if (error) throw error;
}
