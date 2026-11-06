# RELEASED. — prototype

*Never miss a release.* A clickable prototype of the RELEASED. entertainment tracker (iOS / Android / web) built with Expo SDK 58, Expo Router, TypeScript and Zustand.

> **Prototype scope:** everything runs on-device with a **fictional sample catalog** (`src/data/catalog.ts`). There is no Supabase, TMDB, streaming provider or push backend yet. Titles, providers ("StreamBox", "FilmStore"…) and dates are made up and are labelled as sample data.

## Run it

```bash
npm install
npm run web        # browser
npm run android    # Expo Go on an Android phone/emulator
npm run ios        # Expo Go on iOS (needs a Mac for the simulator; a real iPhone works via Expo Go QR)
```

```bash
npm test           # alert-engine unit tests (Node built-in runner)
npm run typecheck
```

## What works

| Area | Status |
|---|---|
| Splash → onboarding → sign up / sign in (local profile) | ✅ |
| Home: trending hero, "coming up for you", continue watching, rails | ✅ |
| Search (debounced, type filter, skeleton loading) and Discover (type + genre filters) | ✅ |
| One details screen for movie / series / anime / documentary with type-specific sections | ✅ |
| Watchlist: add/remove (no duplicates), status, 1–5 rating, notes, search, filter, sort | ✅ |
| Collections: create (unique names), add/remove titles, delete | ✅ |
| Episode tracker: seasons, watched toggles, mark season, progress, next unwatched, spoiler hiding | ✅ |
| Calendar: month / week / upcoming list, my titles vs everything, type filters, region | ✅ |
| Per-title alerts: **all off by default**, movie + show event types, 7d/3d/1d/day/immediate timings | ✅ |
| Notification engine: scheduling, quiet hours, dedupe, prefs re-checked at delivery, unverified dates never alert | ✅ (on-device) |
| Notification center: inbox + scheduled tab, "Check for releases now", deep links to titles | ✅ |
| Where to watch: subscription / rent / buy / cinema per country, data freshness, honest empty state | ✅ |
| Profile stats, settings (region, quiet hours, spoiler protection, sign out, reset) | ✅ |
| State persists across restarts (AsyncStorage) | ✅ |

## Not built yet (needed for the production app)

- Supabase project: migrations, RLS policies, Auth (replaces the local sign-in in `src/app/auth.tsx`)
- TMDB integration via Edge Functions (API key server-side), shared catalog, caching
- Streaming-availability provider adapter (needs a licensed data provider)
- Scheduled release-monitoring jobs (Supabase Cron) — `src/lib/alerts.ts` holds the rules to port server-side
- Real push: `expo-notifications`, device registration, APNs/FCM, EAS development build
- Sentry / PostHog, `.env` config, EAS store builds

## Layout

```
src/app/            routes (Expo Router) — every file is a screen
src/components/ui.tsx  design system: posters, rails, countdown, release rows, episode rows, toggles, empty/loading states
src/lib/alerts.ts   notification rules (pure, unit-tested)
src/lib/progress.ts episode progress helpers
src/store.ts        Zustand store (watchlist, prefs, collections, watched, inbox)
src/data/catalog.ts sample catalog + release events
src/theme.ts        colour / spacing / type tokens
tests/              node:test unit tests
```
