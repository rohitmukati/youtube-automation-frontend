# Reelcast Frontend

Web app for the YouTube Automation backend: connect YouTube accounts, manage a private media library, and publish one video to many channels with live progress.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, TanStack Query, React Hook Form and Zod.

## Getting started       

```bash
npm install
cp .env.example .env.local   # then edit values
npm run dev                  # http://localhost:3000
```

Requires Node.js 20.9 or newer (`.nvmrc` pins 22).

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Brand name shown across the app and legal pages | `Reelcast` |
| `NEXT_PUBLIC_APP_URL` | Public URL of this frontend (SEO, sitemap) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend base URL including `/api/v1` | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_API_SKIP_NGROK_WARNING` | Sends `ngrok-skip-browser-warning` when the backend runs behind ngrok. Keep `false` in production | `false` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Contact address used in legal pages | `support@example.com` |
| `NEXT_PUBLIC_MAX_VIDEO_MB` / `NEXT_PUBLIC_MAX_IMAGE_MB` | Client-side upload limits, keep in sync with the backend | `50` / `10` |

Values are validated at startup in `src/config/env.ts`.

## Backend requirements

In the backend's `app/config.py`:

- `cors_origins` must include this app's origin (for example `http://localhost:3000`). The browser calls the backend directly with a bearer token.
- `frontend_url` must point to this app. After Google OAuth the backend redirects to `/youtube/connect?status=success|error`.

## How authentication works

- Login and signup go through Next.js route handlers in `src/app/api/auth/*`. They call the backend and store the **refresh token in an httpOnly cookie**; the browser never sees it.
- The access token lives in memory only. On reload, the app silently refreshes it from the cookie.
- Refresh runs single-flight and under a Web Lock, so parallel requests and multiple tabs never reuse a rotated refresh token (the backend revokes all sessions on reuse).
- `src/proxy.ts` redirects signed-out users away from app routes and signed-in users away from auth pages.

## Structure

```
src/
  app/              routes: (marketing), (auth), (app), api/auth, SEO files
  components/       ui primitives, layout shell, shared and marketing blocks
  features/         auth, accounts, storage, uploads, dashboard, legal
  lib/              api client, session, errors, formatting, helpers
  config/           env, constants, navigation, site metadata
  hooks/  types/
tests/              unit tests (Vitest)
```

Each feature folder holds its own `api.ts`, `hooks.ts` and components.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests |
| `npm run format` | Prettier |

## Deployment

- **Vercel**: import the repo and set the environment variables above.
- **Docker**: `docker build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com -t reelcast-frontend .` then `docker run -p 3000:3000 reelcast-frontend`. `NEXT_PUBLIC_*` values are baked in at build time.

The legal pages in `src/features/legal` are starting templates. Have them reviewed for your jurisdiction and update the contact email before launch.
