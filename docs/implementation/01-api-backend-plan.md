# Implementation Plan: CMS API Backend

> **Repo:** separate (`golden-cms-api` — name TBD)  
> **Stack:** Node.js + TypeScript + PostgreSQL + REST  
> **Consumers:** CMS dashboard (admin JWT), public website (read-only)  
> **Seed source:** current Golden Quality site JSON + images  
> **Brainstorm:** [`../brainstorm/01-api-backend.md`](../brainstorm/01-api-backend.md)

---

## Locked decisions

| Topic | Decision |
|--------|----------|
| API style | **REST** (`/api/v1/...`) |
| Repositories | **Separate** — API, dashboard, and public website each get their own repo |
| Media storage | **Local disk, folder-based** (see Media layout below) |
| Auth | **JWT** (Bearer token) for admin routes; public routes unauthenticated |
| Cache / freshness | **On-demand website revalidation** — no Redis in v1. Dashboard has **“Update website now”**; API also triggers revalidate on **Publish**. Public site uses tagged cache / ISR and busts via webhook |
| Initial content | **Seed from existing** `content/*.json`, `config/*`, and `public/images/**` |

### Caching decision (POV)

Short TTL alone is a poor fit: editors would wait or refresh blindly. Redis is unnecessary for this content volume.

**Chosen pattern:**

1. Website caches public API responses (Next.js `revalidateTag` / ISR).  
2. API exposes `POST /api/v1/admin/publish/revalidate-website` (the “Update website now” action).  
3. That endpoint calls the website’s `POST /api/revalidate` with a shared `REVALIDATE_SECRET` and content tags (`home`, `projects`, `settings`, …).  
4. Optional: auto-call the same webhook whenever an admin **publishes** a page/project/service (still keep the manual button for batch edits).

No response caching layer inside the API for v1 — Postgres is source of truth; the website owns HTTP/ISR cache.

---

## Out of scope (v1)

- Page/layout builder, theme editing, Sitepins  
- Moving contact SMTP off the public site  
- Redis, S3, multi-admin RBAC beyond single `admin` role  
- Field-level revision history (optional later)  
- GraphQL / tRPC  

---

## Target architecture

```
[CMS Dashboard repo] --JWT--> [API repo] --SQL--> PostgreSQL
                                   |
                                   +-- local disk: storage/uploads/...
                                   |
                     revalidate webhook (secret)
                                   |
                                   v
                         [Public website repo]
```

### Suggested stack (API repo)

| Layer | Choice |
|--------|--------|
| Runtime | Node.js 20+ |
| Framework | Express or Fastify |
| Language | TypeScript |
| ORM / migrations | Prisma + Prisma Migrate |
| Validation | Zod |
| Auth | `jsonwebtoken` + `bcrypt` |
| Uploads | `multer` (or Fastify multipart) → disk |
| Config | `dotenv` + Zod env schema |
| Logging | `pino` |

---

## Media layout (folder-based local disk)

Root: `STORAGE_ROOT` (env), default `./storage`.

```
storage/
  uploads/
    branding/          # logo, favicon, og
    pages/
      home/
      about/
      services/
      contact/
    services/
      {slug}/
        card/
        banner/
        gallery/
    projects/
      {slug}/
        gallery/       # ordered files; order also in DB
    misc/
  seed-import/         # optional temp during seed only
```

**Rules:**

- DB `media` row stores: `id`, `relative_path`, `folder`, `filename`, `mime`, `width`, `height`, `alt_en`, `alt_ar`, `created_at`.  
- Public URL pattern: `GET /media/:id` or static mount `GET /storage/*` (prefer **by id** so renames don’t break).  
- New uploads land in the folder that matches entity type/slug.  
- Project galleries: files under `uploads/projects/{slug}/gallery/` + `project_media.sort_order` in DB (DB order wins).  
- Seed copies existing site images into this tree and registers rows (do not depend on the website `public/` folder at runtime).

---

## Data model (v1)

### Localization

- Collections (`projects`, `services`): **translation tables** (`*_translations` with `locale` `en` | `ar`).  
- Page section blobs + settings groups: **JSONB** payloads with `{ en, ar }` where needed, or per-locale section rows — pick **one page pattern**:  
  - **`pages` + `page_sections(page_key, section_key, locale, payload JSONB)`**  
  - Matches current section names; easy Zod validation per section.

### Tables (summary)

| Table | Purpose |
|--------|---------|
| `users` | Admin login (email, password_hash, role) |
| `pages` | Fixed keys: `home`, `about`, `services_index`, `projects_index`, `contact`, `terms`, `not_found` |
| `page_sections` | `section_key` + `locale` + `payload` JSONB |
| `services` | slug, sort_order, draft, published_at |
| `service_translations` | title, description, details[], meta, introduction, scope, standards, methodology, … |
| `service_media` | role: `card` \| `banner` \| `gallery`, media_id, sort_order |
| `projects` | slug, year, featured, draft, published_at, cover_media_id |
| `project_translations` | title, client, location, content, services tags[] |
| `project_media` | media_id, sort_order |
| `media` | path metadata + alts |
| `settings` | key → JSONB (`site`, `contact_info`, `cta`, `seo`, `pagination`, `social`, …) |
| `menu_items` | location `main`\|`footer`, locale, label, href, sort_order |
| `publish_events` | optional log of revalidate triggers |

### Locked product rules

| Rule | Decision |
|------|----------|
| Page sections | Fixed allow-list per `page_key`; reject unknown keys |
| Featured projects | Soft cap **3** — API returns warning if more; still saves (dashboard shows warning) |
| Slug edits | Allowed for projects/services; v1 **no** automatic redirects (document that URL changes) |
| Terms | Seed placeholder as-is; editable |
| UI strings in layouts | **Not** in API v1 (remain in website code) |
| Draft | `draft=true` hidden from all `/public/*` routes |

---

## REST surface

Base path: `/api/v1`

### System

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| GET | `/health` | no | DB ping |
| GET | `/media/:id` | no | Stream file (or redirect to static) |

### Auth

| Method | Path | Auth | Notes |
|--------|------|------|--------|
| POST | `/auth/login` | no | `{ email, password }` → `{ token, expiresIn }` |
| GET | `/auth/me` | JWT | Current admin |

### Public (website)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/public/pages/:key?locale=` | Full page sections for one key |
| GET | `/public/services?locale=` | Published list |
| GET | `/public/services/:slug?locale=` | Detail + gallery URLs |
| GET | `/public/projects?locale=&page=&perPage=&featured=` | Pagination (default perPage from settings / 6) |
| GET | `/public/projects/:slug?locale=` | Detail + ordered gallery |
| GET | `/public/settings?locale=` | Site, contact, CTA, menus, social, SEO |

Response shapes should stay **close to current JSON** so the website adapter stays thin (see migration brainstorm).

### Admin (dashboard) — all JWT

| Area | Endpoints (illustrative) |
|------|---------------------------|
| Pages | `GET/PATCH /admin/pages/:key` — get/update sections by locale |
| Services | full CRUD + `PATCH .../media` reorder |
| Projects | full CRUD + gallery upload/reorder/cover |
| Media | `GET /admin/media`, `POST /admin/media` (multipart + `folder` hint), `PATCH` alts, `DELETE` |
| Settings | `GET/PATCH /admin/settings/:group` |
| Menus | `GET/PUT /admin/menus/:location` |
| Publish | `POST /admin/publish/revalidate-website` — **Update website now** |
| Publish entity | `POST /admin/projects/:id/publish`, `.../unpublish` (sets draft flags + optional auto-revalidate) |

---

## Env vars (API)

```
NODE_ENV=
PORT=4000
DATABASE_URL=postgresql://...
JWT_SECRET=
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=
ADMIN_PASSWORD=
STORAGE_ROOT=./storage
PUBLIC_MEDIA_BASE_URL=http://localhost:4000/api/v1/media
CORS_ORIGINS=http://localhost:3001,http://localhost:3000
WEBSITE_REVALIDATE_URL=http://localhost:3000/api/revalidate
REVALIDATE_SECRET=
SEED_CONTENT_PATH=../andromeda-1.0.0   # or path to copied fixtures
```

---

## Phased tasks

Each phase ends with a **done check**. Implement in order; do not skip seeding before public routes that depend on real data.

---

### Phase 0 — Repo & project skeleton

**Goal:** Empty runnable API service in its own repo.

- [ ] Create private repo `golden-cms-api` (or chosen name)
- [ ] Scaffold Node + TypeScript (`tsc` or `tsx` for dev)
- [ ] Add Express/Fastify, dotenv, pino, CORS, helmet
- [ ] Add `GET /api/v1/health` returning `{ ok: true }` without DB first, then with DB in Phase 1
- [ ] Add `.env.example`, README (setup, scripts)
- [ ] Add scripts: `dev`, `build`, `start`, `prisma migrate`, `prisma seed`
- [ ] Document that dashboard & website are **separate repos** and will consume this API

**Done when:** `npm run dev` serves health locally.

---

### Phase 1 — Database & migrations

**Goal:** Postgres schema ready for content + auth + media.

- [ ] Add Prisma (or chosen ORM) and `DATABASE_URL`
- [ ] Model tables listed above (users, pages, page_sections, services*, projects*, media, settings, menu_items)
- [ ] Create initial migration
- [ ] Indexes: unique `(page_key isn’t needed if pages.key unique)`, unique `services.slug`, `projects.slug`, unique `(page_id/key, section_key, locale)`, `project_media(project_id, sort_order)`
- [ ] Wire health check to `SELECT 1`
- [ ] Docker Compose snippet for local Postgres (optional but recommended in README)

**Done when:** `prisma migrate dev` applies cleanly on empty DB.

---

### Phase 2 — Auth (JWT)

**Goal:** Secure admin surface.

- [ ] `users` seed will come in Phase 4; for now support creating admin via seed env
- [ ] `POST /api/v1/auth/login` — verify bcrypt hash, return JWT
- [ ] Middleware `requireAuth` — `Authorization: Bearer <token>`
- [ ] `GET /api/v1/auth/me`
- [ ] Reject weak/missing `JWT_SECRET` on boot in production
- [ ] CORS allowlist for dashboard origin only on admin routes (public can be wider)

**Done when:** login returns token; protected route rejects without it.

---

### Phase 3 — Media storage (local folders)

**Goal:** Upload/list/serve files from folder tree.

- [ ] Ensure `STORAGE_ROOT/uploads/...` folders created on boot
- [ ] `POST /api/v1/admin/media` — multipart: file + `folder` (e.g. `projects/oil-gas-lab-equipment/gallery`)
- [ ] Validate mime: jpeg/png/webp/gif; max size (e.g. 10MB)
- [ ] Persist `media` row; optionally read image dimensions (`sharp`)
- [ ] `GET /api/v1/media/:id` — stream file with correct content-type
- [ ] `GET /api/v1/admin/media` — paginated list + filter by folder prefix
- [ ] `PATCH /api/v1/admin/media/:id` — alt_en, alt_ar
- [ ] `DELETE /api/v1/admin/media/:id` — delete DB row + file (block if still referenced, or null references — pick **block if referenced** for safety)

**Done when:** authenticated upload is retrievable by public media URL.

---

### Phase 4 — Seed from existing website content

**Goal:** DB mirrors current Golden Quality content + images.

**Inputs** (from current site repo / copied fixtures):

- `content/en.json`, `content/ar.json`
- `config/config.json`, `menu.en.json`, `menu.ar.json`, `social.json`
- Images under `public/images/branding`, `public/images/golden quality images`, `public/images/projects/project 1…5`, `og-image.png`

**Tasks:**

- [ ] Add `prisma/seed.ts` (idempotent upserts by page key / slug / settings key)
- [ ] Create admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] Insert fixed `pages` rows
- [ ] Map home / about / services_index / projects_index / contact / terms / not_found → `page_sections` per locale
- [ ] Import 3 services + `serviceDetails` into services + translations + card/banner media
- [ ] Import 5 projects + translations; set featured/draft flags
- [ ] Copy project gallery files into `storage/uploads/projects/{slug}/gallery/` preserving **current sort order** (same rules as site `getProjectImages`)
- [ ] Map service galleries (civil→project 4, MEP→project 2, furnishing→project 1+3) into `service_media`
- [ ] Import settings groups + menu items + social
- [ ] Copy branding / home / about / service card images into appropriate folders + link media IDs inside section payloads
- [ ] README: how to point `SEED_CONTENT_PATH` and run `npm run seed`
- [ ] Verify counts: 7 pages, 3 services, 5 projects, menus non-empty, media count ≈ imported files

**Done when:** fresh DB + seed produces full bilingual content without manual SQL.

---

### Phase 5 — Zod contracts & page/section admin APIs

**Goal:** Typed section payloads; admin can edit pages.

- [ ] Define Zod schemas per section (home banner, features, about_us, contact form labels, …) matching current JSON
- [ ] Allow-list `SECTION_KEYS_BY_PAGE`
- [ ] `GET /api/v1/admin/pages` — list page keys + labels for dashboard nav
- [ ] `GET /api/v1/admin/pages/:key?locale=` — sections for editor
- [ ] `PATCH /api/v1/admin/pages/:key` — body: `{ locale, sections: { [sectionKey]: payload } }`; validate; reject unknown keys
- [ ] Resolve media IDs → URLs when responding (helper used by public too)

**Done when:** can PATCH home banner title in `ar` and read it back.

---

### Phase 6 — Services & projects admin APIs

**Goal:** Full collection management including galleries.

**Services:**

- [ ] List / get / create / update / delete (or soft-delete)
- [ ] Publish / unpublish (`draft` flag)
- [ ] Attach/reorder card, banner, gallery media

**Projects:**

- [ ] List (filters: q, featured, draft) / get / create / update / delete
- [ ] Publish / unpublish
- [ ] Gallery: add media, reorder (`PUT` ordered ids), set cover
- [ ] Featured warning when count of featured published > 3
- [ ] Enforce unique slugs

**Done when:** create a draft project with 3 images and reorder gallery via API.

---

### Phase 7 — Settings & menus admin APIs

**Goal:** Global chrome editable.

- [ ] `GET/PATCH /admin/settings/site|contact_info|cta|seo|pagination|social`
- [ ] `GET/PUT /admin/menus/main` and `/admin/menus/footer` (per locale or both locales in one payload)
- [ ] Validate contact fields lightly (email format, non-empty phone)

**Done when:** patch phone number and read updated settings.

---

### Phase 8 — Public read APIs

**Goal:** Website-ready published content.

- [ ] Implement all `/public/*` routes; **filter `draft`**
- [ ] Locale required or default `ar` (match site)
- [ ] Projects pagination default `6`
- [ ] Featured filter for home
- [ ] Shape responses for easy adapter mapping from current `contentParser` output
- [ ] No JWT on public routes
- [ ] Basic rate-limit optional later

**Done when:** unauthenticated GETs return seed data for `locale=ar` and `locale=en` for every page key + all slugs.

---

### Phase 9 — “Update website now” (revalidate)

**Goal:** Dashboard button / publish action refreshes the live site immediately.

- [ ] `POST /api/v1/admin/publish/revalidate-website`  
  - Body optional: `{ tags?: string[] }` (default: all content tags)  
  - Server-side `fetch(WEBSITE_REVALIDATE_URL, { headers/secret, body: { tags } })`  
  - Return `{ ok, websiteStatus, tags }` or clear error if website unreachable
- [ ] Shared `REVALIDATE_SECRET` between API and website  
- [ ] Document tag list: `settings`, `menus`, `home`, `about`, `services`, `projects`, `contact`, `terms`, …  
- [ ] On entity publish/unpublish, **optionally** auto-call revalidate for relevant tags (still keep manual button for batch edits)  
- [ ] Log result in `publish_events` (optional but useful)
- [ ] README contract for website repo: must implement `POST /api/revalidate` verifying secret

**Done when:** calling the admin endpoint hits a mock/local website revalidate route successfully.

---

### Phase 10 — Hardening & handoff

**Goal:** Safe for dashboard + website integration.

- [ ] Central error format: `{ error: { code, message, details? } }`
- [ ] Request validation errors → 400 with Zod issues
- [ ] 401/403/404 consistency
- [ ] Compress / limit JSON body size
- [ ] Ensure `storage/` is gitignored; backups documented (DB + `storage/uploads`)
- [ ] Production notes: process manager, reverse proxy for `/api` and media, HTTPS
- [ ] OpenAPI or markdown route list committed for dashboard team
- [ ] Postman/Insomnia collection or minimal http test script for smoke flows
- [ ] Tag release `v0.1.0` when Phases 0–9 complete

**Done when:** another developer can clone API repo, migrate, seed, login, read public pages, and trigger revalidate using only the README.

---

## Suggested implementation order (summary)

```
0 Skeleton → 1 DB → 2 JWT → 3 Media → 4 Seed
    → 5 Pages admin → 6 Services/Projects admin → 7 Settings
    → 8 Public reads → 9 Revalidate button → 10 Harden
```

---

## Acceptance criteria (API v1 complete)

1. Separate API repo runs against Postgres with migrations.  
2. Seed reproduces current site bilingual content and images.  
3. Admin can login with JWT and edit pages, projects (incl. folder-based galleries), services, settings, menus, media.  
4. Public REST endpoints return only published content for `en` / `ar`.  
5. **Update website now** calls the website revalidate webhook with a shared secret.  
6. Media lives on local disk under a clear folder tree; files served by the API.  
7. No layout/theme builder endpoints.

---

## Dependencies on other repos (later)

| Repo | Needs from this plan |
|------|----------------------|
| CMS dashboard | Admin REST + JWT login + revalidate button wired to Phase 9 |
| Public website | Public REST client + `/api/revalidate` + replace JSON loaders (see `03-website-dynamic-migration.md`) |

---

## Open items deferred (not blocking API plan)

- Soft vs hard delete for projects  
- Preview-draft URLs with signed tokens  
- Moving UI chrome strings into settings  
- Object storage adapter later (keep folder abstraction so swap is possible)

When this plan is approved, implementation starts at **Phase 0** in the new API repository.
