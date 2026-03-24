# Signal Stack

Signal Stack is a Vercel-ready RSS reader and newsroom aggregator built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL on Supabase.

## What it does

- Aggregates tech news media, major platform companies, and semiconductor companies
- Prefers RSS/Atom feeds when available
- Falls back to RSS autodiscovery from HTML pages
- Falls back again to generic HTML scraping when feed URLs fail or do not exist
- Deduplicates inserts with a SHA-256 hash of `url + title`
- Stores refresh logs and keeps processing even if some sources fail
- Exposes API routes for listing articles, sources, manual refresh, and read-state updates
- Schedules a Vercel cron job every 30 minutes and only refreshes between 5:00 and 22:00 Pacific Time

## Stack

- Frontend: Next.js App Router + React + TypeScript + Tailwind CSS
- Backend: Next.js route handlers
- Database: PostgreSQL via Supabase using `DATABASE_URL`
- Feed parsing: `rss-parser`
- Scraping fallback: `cheerio`
- Deployment: Vercel cron + Supabase Postgres

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL="postgresql://..."
APP_URL="http://localhost:3000"
CRON_SECRET="replace-with-a-random-string"
REFRESH_API_TOKEN="optional-manual-refresh-token"
```

Notes:

- `DATABASE_URL` should be the direct Postgres connection string from your Supabase project.
- `CRON_SECRET` protects the Vercel cron route when deployed.
- `REFRESH_API_TOKEN` is optional. If you set it, manual refresh requests to `POST /api/refresh` must include `x-refresh-token`.

## Database setup

The app auto-creates its tables on first API access when `DATABASE_URL` is set.

If you prefer managing schema explicitly in Supabase, use:

- [supabase/migrations/001_init.sql](/Users/ryorong/Documents/New project/supabase/migrations/001_init.sql)

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## API

- `GET /api/articles?page=1&pageSize=20&source=openai&category=tech_company&kind=company&unreadOnly=true`
- `GET /api/sources`
- `POST /api/refresh`
- `PATCH /api/articles/:id/read`

## Deploy on Vercel

1. Create a Vercel project from this repo.
2. Add `DATABASE_URL`, `CRON_SECRET`, and optionally `REFRESH_API_TOKEN`.
3. Keep [vercel.json](/Users/ryorong/Documents/New project/vercel.json) in the root so the 30-minute cron is provisioned.
4. The cron route calls `/api/cron/refresh`, which skips runs outside the Pacific Time refresh window.

## Verification

These checks passed locally:

```bash
npm run typecheck
npm run build
```
