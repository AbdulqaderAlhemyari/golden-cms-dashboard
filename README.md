# غولدن كواليتي — إدارة محتوى الموقع

Arabic-first CMS dashboard for editing Golden Quality website content (pages, projects, services, media, settings).

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Cairo font, RTL (`dir="rtl"`, `lang="ar"`)
- Talks to the CMS API over REST + JWT

## Requirements

- Node.js 20+
- Running CMS API (default `http://localhost:4000`) with dashboard CORS origin allowed (`http://localhost:3001`)

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | API base including `/api/v1` |
| `NEXT_PUBLIC_WEBSITE_URL` | Public site URL for preview links |
| `NEXT_PUBLIC_USE_AUTH_MOCK` | Optional `true` — any email/password logs in (no API) |

## Develop

```bash
npm run dev
```

Opens at [http://localhost:3001](http://localhost:3001) (port **3001** so it matches API CORS defaults).

Unauthenticated visits redirect to `/login`. Use the API seeded admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), or set `NEXT_PUBLIC_USE_AUTH_MOCK=true` for UI-only work.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |

## Docs

- Brainstorm: `docs/brainstorm/02-cms-dashboard.md`
- Implementation plan: `docs/implementation/02-cms-dashboard-plan.md`
- API guide: `docs/guides/dashboard-api.md`

## Editor workflow (plain)

1. Edit content → **حفظ**
2. For projects/services → **إظهار في الموقع** when ready
3. **تحديث الموقع الآن** so visitors see changes
