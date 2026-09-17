# Brainstorm: CMS API Backend (Node.js + TypeScript + PostgreSQL)

> **Purpose:** Capture ideas and constraints for a content-only API before writing an implementation plan.  
> **Scope:** Text + images for existing pages. Not full website control (no layout/theme/code editing).  
> **Related:** `02-cms-dashboard.md`, `03-website-dynamic-migration.md`

---

## 1. Why a separate API exists

Today Golden Quality content lives in:

| Source | Role |
|--------|------|
| `content/en.json` + `content/ar.json` | Almost all page copy, projects, service details |
| `config/config.json`, `menu.*.json`, `social.json` | Brand, contact, nav, CTA, SEO defaults |
| `public/images/**` | Media; project galleries are **folder scans**, not DB lists |

A Node/TS API + Postgres becomes the **single source of truth**. The public Next.js site and the CMS dashboard both talk to it. Editors never edit JSON or rename image folders.

**Out of scope for this backend:** changing component trees, Tailwind/theme tokens, GSAP/Swiper behavior, SMTP secrets as “content,” or building pages from scratch.

---

## 2. Product principles

1. **Content-only** — pages and section *shapes* stay in code; API stores field values.
2. **Bilingual first** — every marketable string supports `en` + `ar` (site default is `ar`).
3. **Page-centric navigation** — API exposes a page tree the dashboard sidebar can list (Home, About, Services, Projects, Contact, Terms, …).
4. **Projects as a real collection** — not a blob inside a giant JSON file; galleries are ordered media relations, not `imageFolder` strings.
5. **Safe publishing** — draft vs published; optional preview; never break the live site with half-edited content.
6. **Seed from current site** — first migration path is: import existing JSON + images into Postgres so go-live looks identical.

---

## 3. Suggested high-level architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│ CMS Dashboard   │────▶│ API (Node + TS)      │────▶│ PostgreSQL      │
│ (Next.js)       │     │ REST and/or tRPC     │     │ + media storage │
└─────────────────┘     │ Auth, validation,    │     └─────────────────┘
                        │ uploads, caching     │
┌─────────────────┐     │                      │
│ Public website  │────▶│ Read (public) APIs   │
│ (existing Next) │     └──────────────────────┘
└─────────────────┘
```

**Open choices to decide in the implementation plan:**

| Topic | Options to weigh |
|-------|------------------|
| API style | REST resources vs tRPC vs GraphQL (likely REST or tRPC for simplicity) |
| Monorepo vs separate repo | Same org, separate deployables vs packages in one repo |
| Media storage | Local disk / S3-compatible / Cloudflare R2; CDN in front |
| Auth | Session cookies (dashboard same-origin proxy) vs JWT; admin-only users first |
| Caching | HTTP cache headers + optional Redis later; public site ISR/revalidate |

---

## 4. Domain model (mirrors the live site)

### 4.1 Fixed pages (singletons per locale, or one row with JSONB locales)

Dashboard nav should list these as “pages,” not free-form builders:

| Page key | Current source | Sections / field groups |
|----------|----------------|-------------------------|
| `home` | `content.*.json` → `home` | SEO, banner (+ image + CTAs), features list, why_choose_us, featured_projects labels |
| `about` | `pages.about` | Banner, about_us (+ image), vision, mission, values[], sectors[] |
| `services_index` | `pages.services` | Banner, SEO, shared UI strings (`know_more` / `close`) |
| `projects_index` | `projectsIndex` | Title, intro, SEO |
| `contact` | `pages.contact` | Intro, form labels, detail labels, business hours |
| `terms` | `pages.terms-policy` | Title, SEO, rich body (currently placeholder — rewrite via CMS) |
| `not_found` | `pages.404` | Title, content |

**Idea:** store section payloads as typed JSONB columns *or* normalized `page_sections` rows keyed by `section_key`. JSONB is closer to current files and faster to ship; normalized rows are better if you need field-level history later.

### 4.2 Collections

**Services** (today: 3 fixed slugs)

- List fields: slug, title, description, details[], image, image_side, order, draft  
- Detail fields: meta_*, banner_image, introduction, scope[], standards, methodology[], gallery media  

**Projects** (today: 5 slugs + folder-based galleries)

| Field | Notes |
|-------|--------|
| `slug` | URL segment |
| `title`, `client`, `location`, `year` | Localized where needed |
| `services[]` | Tags (today free text, not FK to service slugs) |
| `featured`, `draft` | Home featured limit (currently 3) |
| `content` | Rich / markdown body |
| `gallery` | Ordered media IDs — **replaces** `imageFolder` + filesystem scan |
| Cover | Explicit cover media or “first gallery item” rule |

### 4.3 Global settings (singleton)

From `config/config.json` (+ menus + social):

- Site title / logo text / logo / favicon  
- Contact info (phone, email, WhatsApp, location en/ar, tax, CR)  
- Nav + footer menus  
- Social links  
- Global CTA band  
- Default SEO  
- Footer blurb + copyright  
- Pagination size (optional setting)

### 4.4 Media library

Central `media` table:

- `id`, `url` / storage key, `mime`, `width`, `height`, `alt` (en/ar), `created_at`  
- Used by pages, services, projects  

**Idea:** uploads go through the API; public site only receives URLs. Seed existing files under `public/images/golden quality images/` and `public/images/projects/project 1…5/`.

### 4.5 Auth / audit (minimal first version)

- `users` (email, password hash, role: `admin`)  
- Optional: `content_revisions` or activity log (who changed what page when)

---

## 5. Database brainstorm (Postgres)

### 5.1 Sketch of core tables

```
users
locales (or just enum: en | ar)

pages (key, layout_hint, updated_at)
page_translations (page_id, locale, meta_title, description, …)
page_sections (page_id, section_key, sort, payload JSONB)
  -- OR page_translations.content JSONB for whole page

services / service_translations / service_media
projects / project_translations / project_media / project_service_tags

settings (key, value JSONB)  -- or typed settings table
menus / menu_items (locale, location: main|footer, label, href, sort)

media
```

### 5.2 Migrations

- Use a migration tool (**Prisma Migrate**, **Drizzle Kit**, or **node-pg-migrate**).  
- Migrations are the only schema source of truth — no hand-editing prod.  
- Early migrations: empty schema → seedable structure.  
- Later: additive changes (new section keys) without breaking public API contracts.

### 5.3 Seeding ideas

1. **Parse** current `content/en.json` + `content/ar.json` into page/project/service rows.  
2. **Import** `config/config.json`, `menu.en.json`, `menu.ar.json`, `social.json`.  
3. **Register media**: walk `public/images/...`, insert `media` rows, wire project galleries in sorted order (same sort as today’s `getProjectImages`).  
4. **Map service gallery folders** (civil→project 4, MEP→project 2, furnishing→project 1+3) into explicit media links.  
5. Seed one admin user from env (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) — never commit passwords.  
6. Idempotent seed script: safe to re-run in staging (`upsert` by slug/key).

### 5.4 Localization strategy debate

| Approach | Pros | Cons |
|----------|------|------|
| Parallel translation rows | Clean queries per locale | More joins |
| JSONB `{ en, ar }` on fields | Matches current config style | Harder to validate / query |
| Separate documents per locale | Simple reads | Drift between locales |

**Lean toward:** translation tables for collections + JSONB for complex section blobs, unless the team prefers one pattern everywhere.

---

## 6. API surface (ideas, not final routes)

### Public (read-only, used by the website)

- `GET /public/pages/:key?locale=ar`  
- `GET /public/services` / `GET /public/services/:slug`  
- `GET /public/projects` (pagination, featured filter) / `GET /public/projects/:slug`  
- `GET /public/settings` (site, contact, CTA, menus, social)  
- Optional: `GET /public/sitemap-data`

Only **published** content. Fast, cacheable.

### Admin (authenticated, used by dashboard)

- CRUD for page sections / field groups  
- CRUD services & projects (incl. gallery order, featured, draft)  
- Media upload, list, delete, alt text  
- Settings + menus  
- Publish / unpublish  
- Optional: preview token for draft content  

### Non-goals for v1 API

- Visual page builder endpoints  
- Arbitrary new page types without a code deploy  
- Editing theme colors/fonts  
- Replacing `/api/contact` email unless you deliberately move it

---

## 7. Validation & content contracts

- Zod (or similar) schemas that **mirror section shapes** already used by layouts (`HomeBanner`, `About`, `ProjectSingle`, …).  
- Reject unknown section keys for a page (keeps “no full control” promise).  
- Image fields store media IDs; resolve to URLs on read.  
- Markdown/HTML: decide one rich-text format (today some strings use markdown / `</br>`). Normalize going forward.

---

## 8. Media & files

- Upload endpoint with size/type limits (jpg/png/webp/gif).  
- Store originals + optional resized variants for cards/heroes.  
- Alt text required for content images where possible (many heroes currently have empty alt).  
- Keep branding assets (`logo`, `favicon`, `og-image`) as settings media references.

---

## 9. Environments & ops brainstorm

- `.env`: `DATABASE_URL`, `JWT_SECRET` / session secret, `MEDIA_STORAGE_*`, `ADMIN_*`, `CORS_ORIGIN` (dashboard + public site).  
- Separate DBs for local / staging / production.  
- Backup Postgres regularly; media bucket versioning if using object storage.  
- Health check: `GET /health` (db ping).

---

## 10. Risks & decisions to lock before implementation plan

1. **JSONB sections vs fully normalized fields** — speed of build vs editorial precision.  
2. **Gallery migration** — folder scan → ordered media rows must be seeded carefully so projects look unchanged.  
3. **Slug edits** — allow renaming services/projects? Redirects?  
4. **Featured projects** — enforce max 3 in API or leave to editors?  
5. **Terms page** — placeholder content; seed as-is or block publish until rewritten?  
6. **Sitepins leftover** — ignore; do not mix git-CMS with this API model.  
7. **Hardcoded UI labels** in `ProjectSingle.js` / `ServiceSingle.js` / `Footer.js` — include in settings/`ui_strings` or leave in code for v1?

---

## 11. Suggested brainstorm outcome → next doc

Backend should answer: *“Given a page key or collection slug + locale, return the same shape the site already consumes — but from Postgres.”*  
Dashboard (`02`) consumes admin APIs.  
Website migration (`03`) swaps JSON parsers for public API clients (with caching).

**When ready:** turn this file into an implementation plan (stack lock, ERD, migration order, seed script steps, endpoint list, auth flow).
