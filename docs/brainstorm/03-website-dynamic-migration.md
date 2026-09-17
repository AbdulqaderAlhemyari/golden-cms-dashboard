# Brainstorm: Migrating the Website from Constant → Dynamic Content

> **Purpose:** Ideas for evolving the existing Golden Quality Next.js site so it reads content from the CMS API instead of local JSON/config files — without turning the site into a page builder.  
> **Related:** `01-api-backend.md`, `02-cms-dashboard.md`

---

## 1. Current state (what “constant” means here)

The public site is already well-structured for a content swap. Almost nothing is scattered as magic strings inside JSX for marketing copy.

### Content today

| Layer | Location | Loaded by |
|-------|----------|-----------|
| Page / project / service copy | `content/en.json`, `content/ar.json` | `lib/contentParser.js` (`getListPage`, `getRegularPage`, `getSinglePage`, `getServiceDetail`, …) |
| Brand, contact, CTA, SEO defaults | `config/config.json` | `lib/siteConfig.js` helpers |
| Menus | `config/menu.en.json`, `menu.ar.json` | `getMenu()` |
| Social | `config/social.json` | footer / social components |
| Project & service galleries | Folder scan under `public/images/projects/...` | `lib/getProjectImages.js`, service gallery helpers |
| Contact form | `POST /api/contact` | nodemailer + env |

### What stays in code forever

- App Router pages under `app/[locale]/...`  
- Layouts: `HomeBanner`, `About`, `Services`, `ProjectSingle`, `Contact`, etc.  
- GSAP / Swiper / Tailwind / theme tokens (`config/theme.json`)  
- i18n routing (`lib/i18n.js`: `ar` default, `en`)  
- Section **order** and **structure**

### Residual “constants” still in components

Worth tracking during migration (optional CMS later):

- Labels in `ProjectSingle.js`, `ServiceSingle.js` (Overview, Client, Gallery, Request a Quote, …)  
- Some Footer section headings  
- Gallery a11y strings  

---

## 2. Migration goal

**Same pages, same designs, same URLs** — data source changes from filesystem JSON to **public read APIs**.

```
Before:  page.js → contentParser → content/{locale}.json + config/*.json + image folders
After:   page.js → content client → GET /public/... (Postgres via API) + media URLs
```

Editors change text/images in the dashboard; the marketing site only consumes published content.

---

## 3. Guiding principles

1. **Layout ownership stays in the repo** — CMS cannot invent sections the layout doesn’t render.  
2. **Preserve URL structure** — `/{locale}`, `/about`, `/services/:slug`, `/projects`, `/projects/:slug`, `/contact`, etc.  
3. **Preserve bilingual behavior** — locale still from the route; fetch with `?locale=`.  
4. **Shape compatibility** — public API responses should closely match what layouts already expect (or a thin adapter maps API → existing prop shapes).  
5. **Zero big-bang required** — migrate page-by-page behind a feature flag if needed.  
6. **Fallbacks** — staging can fall back to JSON if API is down during development; production should fail soft (cached last good content) where possible.

---

## 4. Adapter strategy (important brainstorm)

Two viable approaches:

### A) Thin client, keep prop shapes

- New `lib/cmsClient.js` (or TS) fetches API.  
- Adapter functions return the **same objects** `HomeBanner` / `About` already use.  
- Minimal layout changes — mostly swap data loaders.

### B) Change layouts to a new CMS schema

- Cleaner long-term types.  
- More touch files and QA.

**Lean toward A for v1** — lower risk; the JSON model is already the de facto schema.

Example conceptual flow:

```
getListPage(locale, "_index.md")
  → today: read content[locale].home
  → later: fetchPublicPage("home", locale) → normalize → { frontmatter, content, ... }
```

Keep legacy function names temporarily as wrappers so `app/[locale]/page.js` barely changes.

---

## 5. What to replace, piece by piece

### Phase ideas (not a formal plan yet)

| Phase | Swap | Notes |
|-------|------|--------|
| 0 | Seed API from current JSON + images | Site still on JSON; API is mirror |
| 1 | Global settings + menus + CTA | Header/footer/contact values from API |
| 2 | Home + About + Contact page copy | High visibility, simple media |
| 3 | Services index + service details | Include gallery media IDs → URLs |
| 4 | Projects index + project details | **Hardest** — gallery no longer from folders |
| 5 | Terms, 404, SEO meta | Cleanup |
| 6 | Remove JSON reads in production | Keep JSON only as seed source / backup |

### Projects gallery migration (critical)

Today:

- Project has `imageFolder: "project 1"`  
- Runtime scans `public/images/projects/project 1/**`

After:

- Project has ordered `gallery: [{ url, alt }, …]` from API  
- `getProjectImages(folder)` becomes `project.gallery` (or adapter fills the same array shape)  
- Cover/card image = explicit cover or `gallery[0]`  

Service galleries that reuse project folders should become explicit media links in the API seed so nothing depends on folder naming.

### Images currently referenced as path strings

Examples:

- `/images/golden quality images/home image.png`  
- `/images/golden quality images/about us.png`  
- `/images/branding/logo.png`  

After CMS: either same public URLs (if media is still served from the site/CDN with stable paths) or new CDN URLs. Layouts already use string `src`s — they don’t care, as long as URLs work.

---

## 6. Rendering & caching ideas

| Topic | Brainstorm |
|-------|------------|
| Server Components | Keep fetching on the server (App Router) — don’t ship API keys to the browser |
| Caching | `fetch` with `next: { revalidate: N }` or tag-based revalidation |
| On-demand revalidation | API/webhook calls `revalidateTag('home')` when editor publishes |
| Static vs dynamic | Can stay mostly static/ISR; only contact form stays dynamic POST |
| Draft preview | Optional: `?preview=token` bypasses cache and requests draft payload |

Avoid client-side fetching for main page content (SEO + flicker).

---

## 7. Files likely to change (inventory)

**Data layer (primary):**

- `lib/contentParser.js`  
- `lib/siteConfig.js`  
- `lib/getProjectImages.js`  
- `lib/getFeaturedProjects.js`  
- `lib/getServiceGalleryImages` (or equivalent)  

**Pages (mostly import paths / await new loaders):**

- `app/[locale]/page.js`  
- `app/[locale]/[regular]/page.js`  
- `app/[locale]/services/[single]/page.js`  
- `app/[locale]/projects/...`  

**Layouts:** ideally untouched if adapters preserve shapes; touch only if gallery props change.

**Config JSON:** stop reading at runtime once API is authoritative; retain in repo as seed fixtures or delete after confidence.

**Sitepins:** leftover theme CMS — do not revive; migration path is custom API + dashboard.

---

## 8. Contact form & other APIs

- `/api/contact` can remain on the public Next app (env-based SMTP).  
- Alternative: move to the CMS API later — not required for content dynamism.  
- Form **labels** come from Contact page content; form **action** stays a site concern.

---

## 9. Environment & config for the public site

New env ideas:

```
CMS_API_URL=https://api.example.com
CMS_API_PUBLIC_KEY=   # if needed for public read
REVALIDATE_SECRET=    # for publish webhooks
```

Local dev: point at local API, or `CONTENT_SOURCE=json|api` flag for gradual switching.

---

## 10. QA checklist ideas (per page)

For each locale (`ar`, `en`):

- [ ] Home: banner text/image, features, why us, featured projects, CTA  
- [ ] About: all sections + image  
- [ ] Services list + each of 3 detail pages + galleries  
- [ ] Projects list pagination (6 per page) + each project gallery order  
- [ ] Contact: labels + values from settings  
- [ ] Header/footer menus, logo, WhatsApp button  
- [ ] SEO titles/descriptions/OG image  
- [ ] RTL/LTR still correct  
- [ ] Draft projects hidden; featured max behavior  

Compare screenshots against pre-migration JSON baseline after seed.

---

## 11. Risks

| Risk | Mitigation idea |
|------|-----------------|
| Gallery order differs after seed | Seed using same sort rules as `getProjectImages` |
| Spaces in image paths | Encode consistently; prefer CDN keys without spaces for new uploads |
| Content shape drift | Shared Zod types between API and site adapter |
| API downtime | ISR cache serves last snapshot; monitoring on `/health` |
| Editors publish broken empty required fields | API validation + dashboard required fields |
| Terms still placeholder | Rewrite in CMS before marketing push |
| Dual source confusion | Feature flag; never write to JSON from production |

---

## 12. Definition of done (migration)

- Production public site does **not** read `content/*.json` or scan project folders for content.  
- Changing copy/images in the dashboard updates the live site after publish/revalidate.  
- All existing routes still work in `ar` and `en`.  
- Layouts/animations unchanged.  
- JSON files remain only as seed input (or archived).

---

## 13. Open questions

1. Serve media from the public Next `public/` folder, from the API host, or from object storage/CDN?  
2. Same deployment monorepo or three deploys (site, API, dashboard)?  
3. How fast must publish → live be (ISR 60s vs on-demand webhook)?  
4. Keep `contentParser` names as wrappers for compatibility, or rename cleanly?  
5. Migrate hardcoded UI labels in the same effort or a later pass?

---

## 14. Next step

After API + dashboard directions are agreed, write an implementation plan that:

1. Locks the public DTO shapes (compatible with current layouts).  
2. Orders the phase swaps above.  
3. Specifies the projects gallery cutover.  
4. Defines revalidation and the `CONTENT_SOURCE` flag for safe rollout.
