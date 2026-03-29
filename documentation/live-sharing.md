# Live sharing (remote viewers)

The host can broadcast the current match to spectators over **Firebase Realtime Database**. Viewers open a short URL with a **4-character code** (letters `A–Z` and digits `0–9`), e.g. `/live/AB12`, and see a **read-only** scoreboard that updates in real time.

## Host flow

- From the scoreboard, open the live settings (share/start/stop). Starting a session allocates a code and a secret host token stored only on the server.
- While live, score changes are **published** to the database through your backend (not written directly from the browser). The host UI shows a share link and optional viewer count.
- Stopping the session removes public data and associated secrets from the database.

## Viewer flow

- Anyone with the link loads `/live/[code]`. The page subscribes to the public session document and shows connection and “session ended” states as appropriate.

## Data model (Realtime Database)

| Path | Purpose |
|------|---------|
| `liveSessions/{code}` | Public snapshot: scoreboard state, `isLive`, timestamps, `expiresAt` (indexed for cleanup). |
| `liveSessionSecrets/{code}` | Server-only: `hostSessionId` used to authorize publish/stop. **Client rules deny all read/write.** |
| `liveSessionWatchers/{code}/{watcherId}` | Anonymous presence: join time and `lastSeenAt` heartbeats for viewer counts. |

Security rules in `database.rules.json` restrict reads to active, non-expired sessions and limit watcher writes to unauthenticated clients with a constrained id shape. **Deploy rules** with the Firebase CLI (`firebase deploy --only database` or your usual pipeline) whenever they change.

## Server API (Next.js route handlers)

| Route | Role |
|-------|------|
| `POST /api/live/start` | Creates a session with a unique code; body: `{ state }` (live scoreboard payload). Returns `{ code, hostSessionId }`. |
| `POST /api/live/publish` | Updates state and extends TTL; body: `{ code, hostSessionId, state }`. |
| `POST /api/live/stop` | Ends session and deletes RTDB trees; body: `{ code, hostSessionId }`. |

All three require the Firebase **Admin** SDK (`FIREBASE_SERVICE_ACCOUNT_JSON` + `FIREBASE_DATABASE_URL`). If admin env is missing, these routes respond with **503**.

## Session lifetime

- Default **TTL is 60 minutes** from the last successful publish (see `SESSION_TTL_MS` in `src/app/api/live/_lib/sessionServer.ts`). After expiry, rules block reads; a scheduled job removes stale rows.

## Scheduled cleanup

- `POST` or `GET` `/api/cron/cleanup-live-sessions` deletes expired sessions (and related paths) using a query on `expiresAt`. **Authorize** with `Authorization: Bearer <CRON_SECRET>` (same value in Vercel env).
- `vercel.json` runs this **once per day at 04:00 UTC**. For stricter retention you can call the same URL from an external cron more often.

## Environment variables

Copy `.env.example` and fill in:

- **Client (public):** `NEXT_PUBLIC_FIREBASE_*` for Realtime Database reads and watcher presence.
- **Server:** `FIREBASE_SERVICE_ACCOUNT_JSON` (service account JSON string) and `FIREBASE_DATABASE_URL` (same DB as the client).
- **Cron:** `CRON_SECRET` for the cleanup route.
