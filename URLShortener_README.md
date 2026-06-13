# URL Shortener — PERN + Redis

A backend-focused URL shortening service built with **Node.js, Express, PostgreSQL, and Redis**, featuring custom aliases, link expiration, click analytics, and tiered rate limiting.

---

## Features

- **Short link generation** using `nanoid` (6-character IDs).
- **Custom aliases** — users can request a specific short ID (`customAlias`), validated against an alphanumeric + hyphen pattern and checked for uniqueness before creation.
- **Link expiration** — optional `expiresIn` (seconds) sets an `expires_at` timestamp; expired links return **HTTP 410 Gone** instead of redirecting.
- **Redis caching layer** for redirects:
  - On lookup, checks Redis first; falls back to Postgres on cache miss.
  - Caches the resolved URL with a **TTL that respects the link's expiry window** (or a 1-hour default for non-expiring links), so expired links are never served stale from cache.
  - Redis failures are handled gracefully — the app degrades to direct DB lookups (`try/catch` around all cache calls) rather than crashing.
- **Click analytics** — every redirect increments a `clicks` counter on the URL row.
- **Two-tier rate limiting** (`express-rate-limit`):
  - Global limiter: 200 requests / 15 minutes per IP (covers redirects and general traffic).
  - Strict limiter on `POST /shorten`: 20 new short URLs per IP per hour, to throttle abuse.
- **Public stats endpoint** (`/api/stats`) — total URLs created and total clicks across the system, computed with aggregate SQL queries.
- **JWT-based auth middleware** (available for protecting future authenticated routes, e.g. per-user link management).
- Centralized error-handling middleware.

---

## Tech Stack

| Layer         | Technology                 |
| ------------- | -------------------------- |
| Backend       | Node.js, Express 5         |
| Database      | PostgreSQL (`pg`)          |
| Cache         | Redis (TLS-enabled client) |
| ID Generation | nanoid                     |
| Auth          | JSON Web Tokens            |
| Rate Limiting | express-rate-limit         |
| Frontend      | React (Vite)               |
| Deployment    | Vercel                     |

---

## Architecture

```
backend/
  src/
    server.js              Verifies DB + Redis connections, starts Express server
    app.js                  Express app: CORS, rate limiters, route mounting, error handler
    config/
      db.js                 PostgreSQL pool
      redis.js              Redis client (TLS), graceful connect/fallback
    controllers/
      url.controller.js     Request validation, response shaping
    services/
      url.service.js        Core logic: create short URL, resolve + cache + click tracking
    routes/
      url.routes.js          POST /shorten, GET /:shortId
      stats.routes.js         GET /api/stats
    middlewares/
      auth.middleware.js     JWT verification
      error.middleware.js    Centralized error handler
    utils/
      generateShortId.js     nanoid(6) wrapper
    migrations/
      add_expires_at.sql
frontend/
  vite-project/             React SPA for creating/viewing short links
```

---

## API Reference

### `POST /shorten`

Create a short URL.

**Request body:**

```json
{
  "url": "https://example.com/very/long/path",
  "customAlias": "my-link", // optional
  "expiresIn": 3600 // optional, seconds
}
```

**Validations:**

- `url` is required and must be a valid URL.
- `customAlias`, if provided, must match `^[a-zA-Z0-9-]+$` and must not already exist.
- `expiresIn`, if provided, must be a positive integer.

**Response (201):**

```json
{
  "shortUrl": "https://short.ly/my-link",
  "expiresAt": "2026-06-12T15:00:00.000Z"
}
```

**Errors:** `400` (invalid URL/alias/expiry, or alias already taken)

---

### `GET /:shortId`

Redirects to the original URL.

- **302** → redirect to original URL (and increments click count)
- **404** → short ID not found
- **410** → link has expired

---

### `GET /api/stats`

```json
{
  "totalUrls": "42",
  "totalClicks": "1290"
}
```

---

## Redirect Flow (Cache-Aside Pattern)

1. Request hits `GET /:shortId`.
2. **Redis lookup** — if hit, increment click count in Postgres and redirect immediately.
3. **Cache miss** — query Postgres for the URL row.
4. If `expires_at` is in the past → return `410 Gone`.
5. Otherwise, cache the URL in Redis with TTL = time until expiry (or 3600s default), increment click count, and redirect.

This minimizes database load for hot links while ensuring expired links are never incorrectly served from a stale cache entry.

---

## Setup

### Backend

```bash
cd backend
npm install
# .env: DATABASE_URL, REDIS_URL, JWT_SECRET, BASE_URL, PORT
npm run dev   # nodemon
```

### Frontend

```bash
cd frontend/vite-project
npm install
npm run dev
```

---

## License

MIT
