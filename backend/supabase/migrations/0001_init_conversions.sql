-- Unit Converter (km <-> mi) — core data layer
-- Run this in the Supabase SQL Editor, or via `supabase db push` if using the CLI.

create extension if not exists "pgcrypto";

create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  input_value numeric not null,
  input_unit text not null check (input_unit in ('km', 'mi')),
  output_value numeric not null,
  output_unit text not null check (output_unit in ('km', 'mi')),
  created_at timestamptz not null default now(),
  constraint conversions_input_nonnegative check (input_value >= 0),
  constraint conversions_units_differ check (input_unit <> output_unit)
);

create index if not exists conversions_user_id_created_at_idx
  on public.conversions (user_id, created_at desc);

-- Row Level Security: every user can only ever see or modify their own rows.
alter table public.conversions enable row level security;

-- Postgres has no `create policy if not exists`, so drop-then-create is the standard
-- idempotent pattern: safe to run this migration again against an already-set-up database.
drop policy if exists "select own conversions" on public.conversions;
create policy "select own conversions"
  on public.conversions for select
  using (auth.uid() = user_id);

drop policy if exists "insert own conversions" on public.conversions;
create policy "insert own conversions"
  on public.conversions for insert
  with check (auth.uid() = user_id);

drop policy if exists "delete own conversions" on public.conversions;
create policy "delete own conversions"
  on public.conversions for delete
  using (auth.uid() = user_id);

-- No update policy: history rows are append-only / delete-only by design.
