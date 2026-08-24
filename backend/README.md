# Backend — Supabase (Postgres)

This app uses [Supabase](https://supabase.com) as a Backend-as-a-Service: managed Postgres +
authentication + row-level security. There is no separate Node/Express server — the frontend
talks to Supabase directly using the public "anon" key, and Postgres itself enforces who can see
what data (see `supabase/migrations/`).

## What's here

- `supabase/migrations/0001_init_conversions.sql` — creates the `conversions` table (one row per
  saved conversion) and the Row Level Security (RLS) policies that guarantee a user can only
  select, insert, or delete **their own** rows.
- `supabase/migrations/0002_verify_conversion_math.sql` — adds a `CHECK` constraint that
  recomputes each row's conversion server-side, so a client can't write a fabricated
  input/output pair. Run this one too — it's not optional.

## One-time setup

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. In your new project, go to **SQL Editor** → **New query**, and run **both** migrations in
   order: paste in `supabase/migrations/0001_init_conversions.sql` first and click **Run**, then
   a **New query** again with `supabase/migrations/0002_verify_conversion_math.sql`.
3. Go to **Project Settings → API Keys**. You'll need two values later for the frontend:
   - **Project URL** (e.g. `https://xxxxxxxx.supabase.co`)
   - The **anon** key from the **Legacy anon, service_role API keys** tab specifically (not the
     newer "Publishable and secret API keys" tab's `sb_publishable_...` key — as of testing, the
     `@supabase/supabase-js@2` build loaded from esm.sh in `supabaseClient.js` returns
     `401 Invalid API key` against the new publishable-key format, but works correctly with the
     legacy JWT-format anon key). The legacy anon key is labeled "safe to use in a browser" in
     the dashboard — it is not a secret; RLS is what actually protects the data.
4. Go to **Authentication → Providers** and confirm **Email** is enabled (it is by default).
   - Note: Supabase's free tier rate-limits outgoing auth emails (a handful per hour). If you're
     testing sign-up repeatedly, you'll hit `email rate limit exceeded` quickly — this is expected
     and not a bug in this project. Space out test sign-ups, or turn off "Confirm email" under
     **Authentication → Settings** for faster local testing (turn it back on before sharing the
     app with real users).

## Why no service-role key anywhere in this repo

The `service_role` key bypasses RLS entirely and must never appear in frontend code or in Git.
Nothing in this project needs it — the anon key + RLS policies are sufficient for all reads and
writes the app performs. If you ever add an admin script, keep the service-role key in a local
`.env` file only (already gitignored) and never commit it.
