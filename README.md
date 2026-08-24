# Unit Converter — Kilometers ⇄ Miles

A small, full-stack unit converter built for the Week 8 Technical Assessment.

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
│   ├── css/styles.css     Responsive, mobile-first styling
│   ├── js/
│   │   ├── converter.js       Pure conversion + validation logic (no DOM — unit tested)
│   │   ├── supabaseClient.js  Creates the Supabase client
│   │   ├── auth.js            Sign up / sign in / sign out
│   │   ├── history.js         Save / fetch / clear a user's conversion history
│   │   ├── app.js             Wires the above to the page
│   │   └── config.example.js  Template — copy to config.js locally, never commit config.js
│   ├── build.js            Generates js/config.js from env vars at deploy time (Vercel)
│   └── vercel.json
├── backend/
│   ├── supabase/migrations/0001_init_conversions.sql   The `conversions` table + RLS policies
│   └── README.md            Supabase setup steps
├── tests/
│   └── converter.test.js    Dependency-free tests for the conversion logic
├── .env.example
└── .gitignore
```

## 2. Step-by-step: run it locally

You need Node.js installed (to run the tests and, optionally, a local static file server). No
other installs are required — the frontend has zero npm dependencies.

1. **Run the tests first**, to confirm the core conversion logic is correct on your machine:
   ```bash
   node --test tests/
   ```
   You should see 9 passing tests.

2. **Set up Supabase** (5 minutes) — full details in [`backend/README.md`](backend/README.md):
   - Create a free project at [supabase.com](https://supabase.com/dashboard).
   - In the SQL Editor, run the contents of
     `backend/supabase/migrations/0001_init_conversions.sql`.
   - Copy your **Project URL** and **anon public key** from Settings → API.

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

## 4. What's already covered

- **MVP scope:** the converter works standalone with zero setup; auth + history is an
  additive layer on top, not a blocker to the core feature.
- **Validation:** empty, non-numeric, negative, and infinite input are all rejected client-side
  with an inline error message (see `converter.js` → `validateInput`, covered by
  `tests/converter.test.js`). The database also enforces valid units and non-negative values via
  `CHECK` constraints as a second layer of defense.
- **Privacy / access control:** Postgres Row Level Security policies on the `conversions` table
  mean a user can only ever `select`/`insert`/`delete` rows where `user_id` matches their own
  authenticated ID — enforced by the database itself, not just app code.
- **No secrets in the repo:** the Supabase anon key is loaded from environment variables at
  Vercel build time, never committed. The Supabase `service_role` key (which *would* be a real
  secret) isn't used anywhere in this project.
- **Testing:** `tests/converter.test.js` covers empty/invalid/negative input, both conversion
  directions against known reference values, and a round-trip sanity check.
- **Mobile:** the layout is a single responsive column with ≥44px touch targets and a viewport
  meta tag — it's a responsive web app rather than a separate native app, so the exact same code
  serves both desktop and mobile browsers.

## 5. Known scope limits (being upfront about what an MVP leaves out)

- No password reset flow, no rate limiting on auth attempts — fine for an assessment, worth
  adding before any real users.
- History is capped at the 50 most recent conversions and has no pagination.
- No automated end-to-end (browser) test suite — `tests/converter.test.js` covers the pure logic;
  the auth/history flows were verified manually against a live Supabase project.
