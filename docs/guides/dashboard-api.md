# CMS Dashboard — API integration guide

Base URL (local): `http://localhost:4000/api/v1`  
Auth: **JWT Bearer** on all `/admin/*` and `/auth/me`.  
CORS: dashboard origin must be in `CORS_ORIGINS` and `CORS_DASHBOARD_ORIGINS` (default `http://localhost:3001`).

Interactive API docs (Swagger): [http://localhost:4000/api/docs](http://localhost:4000/api/docs) — use **Authorize** with a token from `POST /auth/login`.

Browser calls to `/admin/*` with an `Origin` header outside the dashboard allowlist receive **403** `FORBIDDEN_ORIGIN`.

---

## 1. Auth

### Login

```http
POST /auth/login
Content-Type: application/json

{ "email": "admin@example.com", "password": "…" }
```

**200**

```json
{
  "token": "<jwt>",
  "expiresIn": "7d",
  "user": { "id": "…", "email": "…", "role": "admin" }
}
```

Store `token` and send on every admin request:

```http
Authorization: Bearer <token>
```

### Current user

```http
GET /auth/me
Authorization: Bearer <token>
```

**401** without/invalid token: `{ "error": { "code": "UNAUTHORIZED", "message": "…" } }`

---

## 2. Error shape (all APIs)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable",
    "details": {}
  }
}
```

Common codes: `UNAUTHORIZED`, `FORBIDDEN_ORIGIN`, `NOT_FOUND`, `VALIDATION_ERROR`, `SLUG_TAKEN`, `MEDIA_NOT_FOUND`, `MEDIA_IN_USE`, `UNKNOWN_SECTION_KEYS`, `REVALIDATE_FAILED`.

---

## 3. Pages

Section keys are **fixed** per page. Unknown keys on PATCH → **400** `UNKNOWN_SECTION_KEYS`.

| Page key | Section keys |
|----------|----------------|
| `home` | `seo`, `banner`, `features`, `why_choose_us`, `featured_projects` |
| `about` | `seo`, `about_us`, `vision`, `mission`, `values`, `sectors` |
| `services_index` | `seo`, `ui` |
| `projects_index` | `seo`, `intro` |
| `contact` | `seo`, `intro`, `form`, `details`, `business_hours` |
| `terms` | `seo`, `content` |
| `not_found` | `title`, `content` |

```http
GET /admin/pages
GET /admin/pages/home?locale=ar
PATCH /admin/pages/home
Content-Type: application/json

{
  "locale": "ar",
  "sections": {
    "banner": { "title": "…", "subtitle": "…", "image": "<mediaId>", "buttons": [] }
  }
}
```

Responses resolve media ids to `{ "id", "url" }`. When saving, send either a bare media id string or `{ "id": "…" }`.

Locales: `en` | `ar` (site default is `ar`).

---

## 4. Media

```http
GET    /admin/media?page=1&perPage=20&folder=projects
POST   /admin/media          # multipart: file + folder (+ optional altEn, altAr)
PATCH  /admin/media/:id      # { altEn?, altAr? }
DELETE /admin/media/:id      # 409 if still referenced
```

- Allowed types: jpeg, png, webp, gif — max **10MB**
- `folder` example: `projects/oil-gas-lab-equipment/gallery`
- Public file URL: `GET /media/:id` (no auth) — also returned as `url` on media objects

---

## 5. Services

```http
GET    /admin/services?locale=ar&draft=all&q=
GET    /admin/services/:idOrSlug?locale=ar
POST   /admin/services
PATCH  /admin/services/:idOrSlug
DELETE /admin/services/:idOrSlug
POST   /admin/services/:idOrSlug/publish
POST   /admin/services/:idOrSlug/unpublish
PUT    /admin/services/:idOrSlug/media
```

**Create body**

```json
{
  "slug": "my-service",
  "draft": true,
  "sortOrder": 0,
  "translations": {
    "en": { "title": "…", "description": "…", "details": [], "introduction": "", "scope": [], "methodology": [] },
    "ar": { "title": "…", "description": "…", "details": [], "introduction": "", "scope": [], "methodology": [] }
  }
}
```

**Media PUT**

```json
{
  "card": "<mediaId>",
  "banner": "<mediaId>",
  "gallery": ["<id1>", "<id2>"]
}
```

Omit keys you don’t want to change. `null` clears card/banner. `gallery` replaces the full ordered list.

Slug must be unique kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`).

---

## 6. Projects

```http
GET    /admin/projects?locale=ar&draft=all&featured=all&q=
GET    /admin/projects/:idOrSlug
POST   /admin/projects
PATCH  /admin/projects/:idOrSlug
DELETE /admin/projects/:idOrSlug
POST   /admin/projects/:idOrSlug/publish
POST   /admin/projects/:idOrSlug/unpublish
PUT    /admin/projects/:idOrSlug/gallery   # { "mediaIds": ["…"] }
PUT    /admin/projects/:idOrSlug/cover     # { "mediaId": "…" | null }
```

**Create** may include `galleryMediaIds` and `coverMediaId` (cover must be in gallery when gallery is provided).

**Featured soft cap:** more than **3** featured *published* projects still saves, but response may include:

```json
"warnings": [{ "code": "FEATURED_LIMIT", "message": "…" }]
```

Show this warning in the UI; do not block save.

---

## 7. Settings

Groups: `site` | `contact_info` | `cta` | `seo` | `pagination` | `social`

```http
GET   /admin/settings
GET   /admin/settings/contact_info
PATCH /admin/settings/contact_info
Content-Type: application/json

{ "phone": "+966 …", "email": "info@…" }
```

PATCH **shallow-merges** into the existing group. Contact validates email format and non-empty phone when those fields are sent.

---

## 8. Menus

Locations: `main` | `footer`

```http
GET /admin/menus/main
GET /admin/menus/main?locale=ar
PUT /admin/menus/main
Content-Type: application/json

{
  "en": [{ "label": "Home", "href": "/" }],
  "ar": [{ "label": "الرئيسية", "href": "/" }]
}
```

Array order = `sortOrder`. You may send only `en` or only `ar` to replace that locale.

---

## 9. Update website now (revalidate)

```http
POST /admin/publish/revalidate-website
Content-Type: application/json

{ "tags": ["home", "projects"] }
```

Omit `tags` to refresh **all** default tags:  
`settings`, `menus`, `home`, `about`, `services`, `projects`, `contact`, `terms`, `not_found`.

**200** `{ "ok": true, "websiteStatus": 200, "tags": […], "eventId": "…" }`  
**502/503** if the website webhook fails or env is missing.

Wire a dashboard button to this endpoint after batch edits.  
Publish/unpublish on services/projects may also auto-revalidate when the API has `AUTO_REVALIDATE_ON_PUBLISH=true` (response may include a `revalidate` object).

---

## 10. Suggested UI mapping

| Dashboard screen | Endpoints |
|------------------|-----------|
| Login | `POST /auth/login` |
| Pages sidebar | `GET /admin/pages` |
| Page editor | `GET/PATCH /admin/pages/:key` |
| Media library | `/admin/media` |
| Services | `/admin/services` |
| Projects | `/admin/projects` |
| Settings / contact | `/admin/settings/:group` |
| Nav / footer | `/admin/menus/:location` |
| “Update website now” | `POST /admin/publish/revalidate-website` |

---

## 11. Local setup checklist

1. API running: `npm run dev` (port **4000**)
2. `.env` has `CORS_DASHBOARD_ORIGINS=http://localhost:3001` (or your dashboard URL)
3. Admin user seeded: `ADMIN_EMAIL` / `ADMIN_PASSWORD` → `npm run seed`
4. For revalidate testing: website or `node scripts/mock-revalidate-server.mjs` + matching `WEBSITE_REVALIDATE_URL` / `REVALIDATE_SECRET`
