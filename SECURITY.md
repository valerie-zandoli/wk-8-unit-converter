# Security

This is a small, solo-maintained project (a technical assessment), not an actively developed
product — but it's genuinely live and handles real user accounts and data, so a real path for
reporting a problem is worth having.

## Reporting a vulnerability

If you find a security issue — in the app itself, its Supabase configuration, or its deployment
— please open a [GitHub issue](https://github.com/valerie-zandoli/wk-8-unit-converter/issues) or
a private [security advisory](https://github.com/valerie-zandoli/wk-8-unit-converter/security/advisories/new)
if it's sensitive enough that it shouldn't be public before it's fixed. There's no bug bounty and
no formal SLA — this is maintained by one person — but reports will be read and taken seriously.

## What's already in place

- Row Level Security in Postgres, not just app-level checks — see `backend/README.md`.
- No secrets committed to this repo; the Supabase anon key is not a secret (RLS is what actually
  protects the data) — see the README's "No secrets in the repo" section.
- Automated scanning: GitHub secret scanning (with push protection), Dependabot security
  updates, and CodeQL all run on this repo — see `.github/workflows/`.
