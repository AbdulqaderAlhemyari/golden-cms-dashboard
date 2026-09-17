# Public website — API integration guide

Base URL (local): `http://localhost:4000/api/v1`  
Auth: **none** for `/public/*` and `/media/:id`.  
Default locale: **`ar`** (pass `?locale=en` or `?locale=ar`).

Replace static `content/*.json` loaders with these endpoints. Keep response shapes close to today’s parsers where possible.

---

## 1. Locale

Every public content route accepts:

| Query | Values | Default |
|-------|--------|---------|
| `locale` | `ar` \| `en` | `ar` |

---

## 2. Pages

```http
GET /public/pages/:key?locale=ar
```

**Keys:** `home`, `about`, `services_index`, `projects_index`, `contact`, `terms`, `not_found`

**200**

```json
{
  "key": "home",
  "label": "Home",
  "locale": "ar",
  "sections": {
    "seo": { "meta_title": "…", "description": "…", "image": { "id": "…", "url": "http://localhost:4000/api/v1/media/…" } },
    "banner": { "title": "…", "subtitle": "…", "image": { "id": "…", "url": "…" }, "buttons": [] },
    "features": { },
    "why_choose_us": { },
    "featured_projects": { }
  }
}
```

- Media fields are `{ id, url }` (use `url` in `<img src>`).
- If the page’s `seo.draft === true`, the API returns **404**.

Map site routes roughly as:

| Site route | Page key |
|------------|----------|
| `/` | `home` |
| `/about` | `about` |
| `/services` (index copy) | `services_index` |
| `/projects` (index copy) | `projects_index` |
| `/contact` | `contact` |
| terms | `terms` |
| 404 | `not_found` |

Service **cards** and project **lists** come from collection endpoints below, not from `services_index` / `projects_index` alone.

---

## 3. Services

### List (published only)

```http
GET /public/services?locale=ar
```

```json
{
  "locale": "ar",
  "items": [
    {
      "slug": "civil-works",
      "title": "…",
      "description": "…",
      "details": ["…"],
      "image": "http://localhost:4000/api/v1/media/…",
      "image_side": "right",
      "sort_order": 0
    }
  ]
}
```

### Detail

```http
GET /public/services/:slug?locale=ar
```

```json
{
  "locale": "ar",
  "service": {
    "slug": "civil-works",
    "title": "…",
    "meta_title": "…",
    "description": "…",
    "introduction": "…",
    "scope": [],
    "standards": "…",
    "methodology": [],
    "details": [],
    "image": "…",
    "banner_image": "…",
    "gallery": ["https://…/media/id1", "https://…/media/id2"],
    "image_side": "right",
    "sort_order": 0
  }
}
```

Draft services are **hidden** (404 on detail, omitted from list).

---

## 4. Projects

### List (published only)

```http
GET /public/projects?locale=ar&page=1&perPage=6&featured=true
```

| Query | Notes |
|-------|--------|
| `page` | default `1` |
| `perPage` | default from settings `pagination.per_page`, else **6** |
| `featured` | `true` \| `false` — omit for all published |

```json
{
  "locale": "ar",
  "page": 1,
  "perPage": 6,
  "total": 5,
  "totalPages": 1,
  "items": [
    {
      "slug": "oil-gas-lab-equipment",
      "title": "…",
      "client": "…",
      "location": "…",
      "year": 2025,
      "services": ["…"],
      "featured": true,
      "content": "…",
      "image": "https://…/media/…",
      "images": ["https://…/media/…"]
    }
  ]
}
```

Use `featured=true` for the home featured strip (soft cap of 3 is editorial; API may return more).

### Detail

```http
GET /public/projects/:slug?locale=ar
```

```json
{
  "locale": "ar",
  "project": {
    "slug": "…",
    "title": "…",
    "client": "…",
    "location": "…",
    "year": 2025,
    "services": [],
    "featured": true,
    "content": "…",
    "image": "…",
    "images": ["…"]
  }
}
```

`images` is the ordered gallery (same sort rules as the old folder scan). `image` is the cover (or first gallery image).

---

## 5. Settings + menus (global chrome)

```http
GET /public/settings?locale=ar
```

```json
{
  "locale": "ar",
  "site": { "title": "…", "logo": { "id": "…", "url": "…" }, "footer_content": "…", "copyright": "…" },
  "contact_info": { "phone": "…", "email": "…", "location": "…", "whatsapp": "…" },
  "cta": { "enable": true, "title": "…", "content": "…", "contact_label": "…", "whatsapp_label": "…" },
  "seo": { "meta_author": "…", "meta_image": { "id": "…", "url": "…" }, "meta_description": "…" },
  "pagination": { "per_page": 6 },
  "social": { "instagram": "", "linkedin": "" },
  "menus": {
    "main": [{ "name": "الرئيسية", "url": "/" }],
    "footer": [{ "name": "…", "url": "…" }]
  }
}
```

Bilingual config fields are **already resolved** to the requested locale (strings, not `{ en, ar }` objects).

Menu item shape matches the old menu JSON: `{ name, url }`.

---

## 6. Media files

```http
GET /media/:id
```

Streams the file with the correct `Content-Type`. Prefer the `url` fields returned by public APIs; do not rebuild paths from the old `/images/...` tree.

CORS / CORP: the API allows cross-origin media loading from configured website origins.

---

## 7. Cache revalidation (required on the website)

When editors click **Update website now** (or publish), the API calls your site:

```http
POST /api/revalidate
Header: x-revalidate-secret: <REVALIDATE_SECRET>
Content-Type: application/json

{
  "tags": ["settings", "menus", "home", "about", "services", "projects", "contact", "terms", "not_found"],
  "secret": "<REVALIDATE_SECRET>"
}
```

**Website must:**

1. Verify `x-revalidate-secret` (or body `secret`) against the same `REVALIDATE_SECRET` as the API.
2. Call Next.js `revalidateTag` / path revalidation for the given tags.
3. Return **2xx** on success.

Suggested tag usage:

| Tag | Bust |
|-----|------|
| `home` | Home page data |
| `about` | About |
| `services` | Services list + details |
| `projects` | Projects list + details |
| `contact` | Contact |
| `terms` | Terms |
| `not_found` | 404 copy |
| `settings` / `menus` | Layout chrome |

Tag ISR/fetch with the same names when you load public API data, e.g. `fetch(url, { next: { tags: ['home'] } })`.

Shared env (website + API):

```
REVALIDATE_SECRET=…
WEBSITE_REVALIDATE_URL=http://localhost:3000/api/revalidate   # on the API side
```

---

## 8. Adapter tips

1. Swap `contentParser` / JSON imports for `fetch(`${API}/public/...`)`.
2. Prefer `locale` from the Next `[locale]` segment.
3. Treat missing/404 as unpublished or unknown slug.
4. Do **not** call `/admin/*` from the public site.
5. Contact form SMTP can stay on the website in v1 (out of API scope).

---

## 9. Quick smoke (no auth)

```bash
curl "http://localhost:4000/api/v1/public/pages/home?locale=ar"
curl "http://localhost:4000/api/v1/public/services?locale=en"
curl "http://localhost:4000/api/v1/public/projects?locale=ar&featured=true"
curl "http://localhost:4000/api/v1/public/settings?locale=ar"
```
