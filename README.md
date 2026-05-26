# Crypto Advisor

A small fullstack crypto dashboard: auth + daily market news, prices, and a fresh meme each refresh.

- **Frontend:** React + Vite + TypeScript + PrimeReact, deployed on Vercel
- **Backend:** Node + Express + TypeScript, deployed on Render
- **Database:** PostgreSQL (Render free tier - 90-day expiry)
- **Auth:** JWT (Bearer tokens)

## Stack & Reasoning

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20+ | The brief mandates Node.js |
| Backend framework | Express 4 | Universal default for Node APIs, minimal ceremony, matches what every Render guide assumes |
| Frontend | React + Vite + TypeScript | Pure SPA, fastest deploy to Vercel, no Next.js overhead since the backend is separate |
| UI components | PrimeReact + PrimeIcons (`lara-dark-blue` theme) | Production component library with strong DataTable / Card / Skeleton - gives the dashboard a polished look without bespoke CSS |
| Forms | react-hook-form + zod | Schema-driven validation, minimal boilerplate, type-safe |
| Data fetching | TanStack Query | Server-state cache with auto-revalidation, replaces manual `fetch + setState` patterns |
| Database driver | `pg` (raw, no ORM) | Single `users` table doesn't justify an ORM. A tiny `query<T>(sql, params)` helper keeps route code clean |
| Auth | JWT in `localStorage` + Bearer header | Stateless, works cleanly across separate FE/BE deploys (no cookie-domain issues). Known trade off: localStorage is XSS-exposed - see "Known limitations" |
| Caching | In-memory `Map` with TTL | Prices 60s, news 5min. Reduces external API quota usage, cold-start friendly |
| News source | CoinDesk RSS feed + bundled fallback | No API key required (public RSS), parsed with `rss-parser`. Falls back to a bundled JSON if upstream is unavailable |
| Meme source | `r/cryptomemes` JSON + bundled fallback | No API key, no account. Fallback ensures the dashboard always renders something |

## Local Development

### Prerequisites

- Node.js 20 or later (tested on 24)
- PostgreSQL (any type that accepts a connection string )

### Backend

```bash
cd backend
cp .env.example .env       # then fill in JWT_SECRET, DATABASE_URL
npm install
npm run dev                # listens on http://localhost:4000
```

The server boots, runs an idempotent migration to create the `users` table, then accepts requests.

### Frontend

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:4000
npm install
npm run dev                # opens http://localhost:5173
```

### Verifying it works locally

```bash
# Should return 200 ok
curl http://localhost:4000/health

# Should return 401 (auth required)
curl http://localhost:4000/api/prices

# Register a user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","name":"Tester","password":"password123"}'

# Use the token from the response
TOKEN="..."
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/prices
```

## Known Limitations

- **Render free web tier sleeps after 15 min of inactivity** - first request after sleep takes ~30 seconds (cold start).
- **Render Postgres free tier deletes the DB after 90 days** - backup with `pg_dump` and re-provision if you need to keep going past that.
- **JWT in localStorage** - XSS-exposed. In production, switch to httpOnly cookies + CSRF token. Documented this trade-off in the explanation file.

## Project Structure

```
crypto-advisor/
├── backend/             Express API
│   └── src/
│       ├── server.ts        Bootstrap
│       ├── config.ts        Env loading
│       ├── db/              pg Pool + migrations
│       ├── middleware/      auth (JWT verify), errorHandler
│       ├── routes/          /auth, /api/news, /api/prices, /api/meme
│       ├── services/        External API clients + in-memory cache
│       └── data/            Fallback JSON for news + memes
└── frontend/            React + Vite SPA
    └── src/
        ├── main.tsx
        ├── App.tsx          Router + QueryClient
        ├── api/             axios client + auth + endpoints
        ├── hooks/           TanStack Query wrappers
        ├── pages/           Login, Register, Dashboard
        └── components/      Layout, sections, FormField
```
