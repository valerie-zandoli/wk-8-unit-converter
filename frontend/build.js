// Runs at deploy time (Vercel build command). Writes js/config.js from environment variables
// so the Supabase URL/key never need to live in the Git repo. Locally, just copy
// js/config.example.js to js/config.js by hand instead of running this.
import { writeFileSync } from 'node:fs';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Missing SUPABASE_URL and/or SUPABASE_ANON_KEY environment variables.\n' +
      'Set them in your Vercel project (Settings → Environment Variables) before deploying.'
  );
  process.exit(1);
}

const contents = `// Auto-generated at build time by build.js — do not edit, do not commit.
export const SUPABASE_URL = ${JSON.stringify(SUPABASE_URL)};
export const SUPABASE_ANON_KEY = ${JSON.stringify(SUPABASE_ANON_KEY)};
`;

writeFileSync(new URL('./js/config.js', import.meta.url), contents);
console.log('Wrote js/config.js from environment variables.');
