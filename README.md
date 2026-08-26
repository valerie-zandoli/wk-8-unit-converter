# Unit Converter — Kilometers ⇄ Miles

A small, full-stack unit converter built for the Week 8 Technical Assessment.

- **Live app:** https://frontend-flame-eta-34.vercel.app
- **Repo:** https://github.com/valerie-zandoli/wk-8-unit-converter (connected to Vercel — pushes
  to `main` redeploy automatically)

- **Frontend:** plain HTML, CSS, and JavaScript (no framework, no build tool required to run it
  locally) — deployed to **Vercel**. Works on desktop and mobile browsers via responsive design.
- **Backend / data layer:** **Supabase** (managed **Postgres**) for auth and for storing each
  signed-in user's private conversion history, protected by Postgres **Row Level Security**.

The converter itself (enter a number, pick a direction, see the result) works instantly with
**no login and no backend call** — it's pure client-side math. Signing in additionally saves a
private history of your conversions, which is the one feature that actually needs a backend.

---

## 1. How it's organized

```
wk-8/
├── frontend/              Everything deployed to Vercel
│   ├── index.html         The whole app UI (converter + auth + history)
│   ├── css/styles.css     Responsive, mobile-first styling, light + dark
│   ├── js/
│   │   ├── converter.js       Pure conversion + validation logic (no DOM — unit tested)
│   │   ├── authErrors.js      Pure mapping of Supabase error strings to plain copy (unit tested)
│   │   ├── supabaseClient.js  Creates the Supabase client
│   │   ├── auth.js            Sign up / sign in / sign out
│   │   ├── history.js         Save / fetch / delete-one / clear-all a user's conversion history
│   │   ├── app.js             Wires the above to the page
│   │   └── config.example.js  Template — copy to config.js locally, never commit config.js
│   ├── build.js            Generates js/config.js from env vars at deploy time (Vercel)
│   └── vercel.json         Build config, CSP/security headers, and skips builds for changes
│                           outside this directory
├── backend/
│   ├── supabase/migrations/
│   │   ├── 0001_init_conversions.sql        The `conversions` table + RLS policies
│   │   └── 0002_verify_conversion_math.sql  DB-side check that output_value is really correct
│   └── README.md            Supabase setup steps
├── tests/
│   ├── converter.test.js      Tests for the conversion logic
│   └── authErrors.test.js     Tests for the error-message mapping
├── .github/workflows/
│   ├── test.yml             Runs the test suite on every push and PR
│   └── codeql.yml           Static security analysis (CodeQL) on push, PR, and weekly
├── LICENSE                  MIT
├── SECURITY.md              How to report a vulnerability
├── .env.example
└── .gitignore
```

## 2. Step-by-step: run it locally

You need Node.js installed (to run the tests and, optionally, a local static file server). No
other installs are required — the frontend has zero npm dependencies.

1. **Run the tests first**, to confirm the core conversion logic is correct on your machine:
   ```bash
   npm test
   ```
   You should see 11 passing tests.

2. **Set up Supabase** (5 minutes) — full details in [`backend/README.md`](backend/README.md):
   - Create a free project at [supabase.com](https://supabase.com/dashboard).
   - In the SQL Editor, run **both** files in `backend/supabase/migrations/`, in order
     (`0001_init_conversions.sql`, then `0002_verify_conversion_math.sql`).
   - Copy your **Project URL** and the **anon** key from the **Legacy anon, service_role API
     keys** tab under Settings → API Keys (not the newer "Publishable" key — see
     [`backend/README.md`](backend/README.md) for why).

3. **Configure the frontend locally**:
   ```bash
   cp frontend/js/config.example.js frontend/js/config.js
   ```
   Open `frontend/js/config.js` and paste in your Project URL and anon key.
   (`config.js` is gitignored — it will never be committed.)

4. **Serve the frontend** (it uses ES modules, so it must be served over HTTP, not opened as a
   `file://` URL):
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```
   Then open **http://localhost:8080** in your browser.

5. **Try it out**: convert a number with no login (works immediately), then sign up with an
   email/password to start seeing saved history.

## 3. Step-by-step: deploy to Vercel

1. Push this project to a GitHub repo (the `.gitignore` already keeps `config.js` and `.env`
   out of it — double check with `git status` before your first commit).
2. In [Vercel](https://vercel.com), **Add New → Project**, import the repo.
3. Set **Root Directory** to `frontend`.
4. Under **Environment Variables**, add:
   - `SUPABASE_URL` = your Supabase Project URL
   - `SUPABASE_ANON_KEY` = your Supabase anon public key
5. Deploy. Vercel runs `npm run build` (defined in `frontend/package.json`), which runs
   `build.js` to generate `js/config.js` from those environment variables at build time — so
   the real values live only in Vercel's dashboard, never in the repo.
6. Open the deployed URL on your phone to confirm the mobile layout.
7. **Back in Supabase**, go to **Authentication → URL Configuration** and set **Site URL** to
   your deployed URL (e.g. `https://your-project.vercel.app`). Every new Supabase project
   defaults this to `http://localhost:3000` — skip this step and every sign-up confirmation
   email will redirect a real user to a dead local address right after they confirm. (Their
   account still confirms successfully either way; only the post-click redirect is affected.)

## 4. What's already covered

- **MVP scope:** the converter works standalone with zero setup; auth + history is an
  additive layer on top, not a blocker to the core feature.
- **Validation:** empty, non-numeric, negative, and infinite input are all rejected client-side
  with an inline error message (see `converter.js` → `validateInput`, covered by
  `tests/converter.test.js`). The database enforces the same rules again independently via
  `CHECK` constraints (valid units, non-negative values, and — via migration `0002` — that
  `output_value` is actually the correct conversion of `input_value`, not just any number).
- **Privacy / access control:** Postgres Row Level Security policies on the `conversions` table
  mean a user can only ever `select`/`insert`/`delete` rows where `user_id` matches their own
  authenticated ID — enforced by the database itself, not just app code. Verified directly
  against the live API with the anon key and no session: reads return `[]`, writes return `401`.
- **No secrets in the repo:** the Supabase anon key is loaded from environment variables at
  Vercel build time, never committed. The Supabase `service_role` key (which *would* be a real
  secret) isn't used anywhere in this project.
- **Security headers:** the live site sends a `Content-Security-Policy` scoped to exactly what
  the app needs, plus `X-Frame-Options`, `X-Content-Type-Options`, a referrer policy, and a
  permissions policy (see `frontend/vercel.json`).
- **Automated scanning:** GitHub secret scanning (with push protection) and Dependabot security
  updates are both on, and CodeQL runs on every push, every PR, and weekly on a schedule (see
  `.github/workflows/codeql.yml`).
- **Testing:** `tests/converter.test.js` and `tests/authErrors.test.js` — 11 tests covering
  empty/invalid/negative input, both conversion directions against known reference values, a
  round-trip sanity check, and every mapped auth-error string plus the unmapped fallback. A
  GitHub Actions workflow runs the suite on every push and PR.
- **Mobile + dark mode:** the layout is a single responsive column with ≥44px touch targets and a
  viewport meta tag — a responsive web app rather than a separate native app, so the exact same
  code serves both desktop and mobile browsers. Colors follow the system's light/dark preference
  via `prefers-color-scheme`, with `color-scheme` declared so native form controls follow suit.
- **History management:** signed-in users can delete a single conversion or clear all of them;
  both actions are RLS-scoped so a user can only ever affect their own rows. Clearing everything
  asks for confirmation first, since it can't be undone. Screen reader users get a live
  announcement whenever the list changes — an addition, a deletion, or a clear. If a save fails
  (a dropped connection, for example), the app says so rather than the conversion just quietly
  not showing up in history later.

## 5. Known scope limits (being upfront about what an MVP leaves out)

- No password reset flow. Auth attempts *are* rate-limited, but only by Supabase's own platform
  defaults (a few auth emails per hour on the free tier, 30 sign-up/sign-in requests per 5 minutes
  per IP) — there's no custom app-level throttling on top of that.
- History is capped at the 50 most recent conversions and has no pagination.
- No automated end-to-end (browser) test suite — `tests/converter.test.js` and
  `tests/authErrors.test.js` cover the pure logic; the auth/history flows were verified manually,
  repeatedly, against a live Supabase project.
- `main` has no branch protection, so CI passing doesn't currently block anything from landing —
  a deliberate choice for a solo-maintained repo where every change so far has been a direct push,
  not an oversight. It's the first thing worth turning on if this ever moves to a workflow with
  more than one contributor, since the CI check already exists and only needs to be required.
