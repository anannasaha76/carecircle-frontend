<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CareCircle Frontend — Agent Notes

## What this is

- Next.js 16.4.5 App Router + React 19 + Tailwind v4. All pages are client components (`"use client"`) that call a **separate** backend; there are no server actions and no server-side data fetching.
- The backend is a sibling repo at `../carecircle-backend` (Express 5 + MongoDB, single `index.js`, port 8000). The app is not usable without it running.

## Commands

- `npm run dev` — Turbopack dev server. `next dev` also rewrites the Next.js block above.
- `npm run build`, `npm start`
- `npm run lint` — ESLint flat config (`eslint.config.mjs`).
- `npx tsc --noEmit` — no typecheck script exists; run directly.
- No test suite or test config exists.
- Backend: run `npm run dev` in `../carecircle-backend`. It needs its own `.env` (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `CLIENT_URL`).

## Environment

- `.env` (gitignored): `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `NEXT_PUBLIC_API_URL`, optional `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- Code falls back to `http://localhost:8000` when `NEXT_PUBLIC_API_URL` is unset.
- Frontend and backend must share the same `BETTER_AUTH_SECRET`; the backend verifies the Better Auth JWT with it.

## Auth

- Better Auth server config: `src/lib/auth.ts` (Mongo adapter, `jwt` plugin, extra `photoURL` user field). Client: `src/lib/auth-client.ts`. Handler: `src/app/api/auth/[...all]/route.ts`.
- Protected backend calls send the Better Auth JWT as `Authorization: Bearer`: `getTokenFromClient()` in components, `getTokenFromServer()` in server code.
- `src/proxy.ts` (Next 16's renamed middleware) centrally guards `/create-event`, `/manage-events`, and `/joined-events`, redirecting unauthenticated visitors to `/login?callbackUrl=...`. Auth pages (`/login`, `/signup`) redirect authenticated users back to the app. Protected pages also keep client-side fallback redirects. The register page is `/register`.
- Social sign-in success toast is a two-part contract: the login page writes `SOCIAL_LOGIN_KEY` (exported from `src/components/providers/SocialLoginToast.tsx`) to `sessionStorage` before `signIn.social` redirects away, and the global `SocialLoginToast` watcher mounted in `layout.tsx` clears the flag and fires the toast once a session loads. Any new social provider must set/clear this flag or the toast breaks.

## Backend API contract (`NEXT_PUBLIC_API_URL`)

- Responses use `{ success, data?, message? }`. Endpoints used: `GET /events`, `/events/recent`, `/events/:id`, `/events/:id/join-status`, `GET /my-events`, `GET /joined-events`; `POST /events`, `PUT|DELETE /events/:id`, `POST /events/:id/join`, `DELETE /joined-events/:id`.
- Create/update/delete/join/joined-events require the Bearer token; ownership is checked via `creatorEmail` for events and `email` query param for joined events.

## UI conventions (differ from typical shadcn/Radix)

- shadcn style is `base-nova`, built on **Base UI** (`@base-ui/react`), not Radix. Compose with the `render={<Element .../>}` prop; there is no `asChild`.
- `Select.onValueChange` provides `string | null`.
- `cn` comes from the `cn` package and is re-exported by `@/lib/utils`; import it from there.
- Tailwind v4 is CSS-first (`src/app/globals.css`); there is intentionally no `tailwind.config`.
- Toasts: use `notify` from `@/lib/notify`, not a toast library directly.
- Event dates are `YYYY-MM-DD` strings. Parse manually (`new Date(y, m - 1, d)`); `new Date("YYYY-MM-DD")` shifts by UTC. Compute "today" after mount (`useSyncExternalStore`/`useEffect`) to avoid hydration mismatches.
- Images are plain `<img>` with `eslint-disable` + `onError` fallback, not `next/image`.

## Next.js config

- `next.config.ts` enables `cacheComponents` + `partialPrefetching` (PPR) and `reactCompiler`.
- This is Next 16, not 15 (e.g. `proxy.ts` replaced `middleware.ts`). Read `node_modules/next/dist/docs/` before using framework APIs.
- Path alias: `@/*` → `src/*`.
