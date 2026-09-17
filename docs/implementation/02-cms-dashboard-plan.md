# Implementation Plan: CMS Dashboard

> **Repo:** separate (`golden-cms-dashboard` — name TBD)  
> **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS  
> **API:** REST + JWT against [`01-api-backend-plan.md`](./01-api-backend-plan.md)  
> **Audience:** non-technical editors — Arabic-first UI, plain terminology  
> **Brainstorm:** [`../brainstorm/02-cms-dashboard.md`](../brainstorm/02-cms-dashboard.md)

---

## Locked decisions

| Topic | Decision |
|--------|----------|
| UI language | **Arabic-first** — all chrome, buttons, errors in Arabic |
| Content editing | **One tab at a time:** `العربية` \| `English` |
| Arabic copy | **§ Copy module** below — single source (`lib/copy/ar.ts`) |
| Layout direction | **RTL** for dashboard shell |
| API | **REST** admin routes + JWT Bearer |
| Repos | **Separate repo** from API and public website |
| Go live | **تحديث الموقع الآن** → `POST /api/v1/admin/publish/revalidate-website` |
| Terms page | **Included in v1** — editable like other pages |
| Delete projects/services | **Hide first** (`إخفاء من الموقع`); **حذف** only with strong confirm dialog (hard delete via API) |
| Website menu | **Labels + order only** in v1 — fixed five links (same URLs as today); no add/remove menu items |
| Devices | **Desktop-first**, **tablet-friendly** (large touch targets, no phone-first layout) |
| Autosave | **Explicit حفظ** — clearer for non-technical users; toast **تم الحفظ** |

### Remaining open questions — resolved for v1

| Question | v1 choice |
|----------|-----------|
| Terms in v1? | Yes |
| Delete vs hide? | Both: hide is default; delete is rare + confirm |
| Menu add/remove? | No — edit text and order only |
| iPad? | Supported at tablet width; primary QA on desktop |

---

## Out of scope (v1)

- English dashboard chrome  
- Visual page builder / drag-and-drop layout  
- Side-by-side AR/EN editing  
- Multi-user roles beyond single admin  
- In-app analytics  
- Editing hardcoded website UI strings (Overview, Footer headings — stay in website code)  
- Self-service password reset (manual admin reset via API/DB if needed)

---

## Target architecture

```
Browser (RTL Arabic UI)
        │
        ▼
[Next.js Dashboard]  ──JWT──▶  [CMS API]  ──▶  PostgreSQL + disk media
        │                              │
        │   «تحديث الموقع الآن»         └──▶  website /api/revalidate
        │
        └── opens public site links (new tab) for «عرض في الموقع»
```

### Suggested stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 15+ App Router |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Font | **Cairo** (matches public site Arabic) |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query (React Query) |
| HTTP | `fetch` wrapper with JWT interceptor |
| Drag reorder | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Rich text | TipTap (minimal toolbar: bold, lists, links) — labeled **نص منسّق** |
| Icons | Lucide or Heroicons + always with Arabic label |
| Toasts | Sonner or similar |
| Auth storage | JWT in `localStorage` key `gq_cms_token` (v1); redirect to login if missing/expired |

---

## Copy module (mandatory)

All user-visible strings live in one file — **never hardcode Arabic in components ad hoc**.

```
src/lib/copy/ar.ts          # UI strings (sidebar, buttons, errors)
src/lib/copy/sections.ts    # Human section titles per page (Arabic)
src/lib/copy/fields.ts      # Field labels + help text per page/section
```

Glossary source: brainstorm §2.3. Example exports:

```ts
export const copy = {
  appTitle: "غولدن كواليتي — إدارة محتوى الموقع",
  save: "حفظ",
  updateWebsite: "تحديث الموقع الآن",
  // ...
} as const;
```

Map API/Zod errors to Arabic in `lib/errors/mapApiError.ts` — users never see raw codes.

---

## App routes (Next.js)

| Route | Screen (Arabic title) | API used |
|-------|------------------------|----------|
| `/login` | تسجيل الدخول | `POST /auth/login` |
| `/` | redirect → `/overview` or `/login` | — |
| `/overview` | الرئيسية — ماذا تريد أن تعدّل؟ | stats from projects/settings |
| `/pages/home` | تعديل الصفحة الرئيسية | `GET/PATCH /admin/pages/home` |
| `/pages/about` | من نحن | `/admin/pages/about` |
| `/pages/services` | صفحة الخدمات | `/admin/pages/services_index` |
| `/pages/projects` | صفحة المشاريع | `/admin/pages/projects_index` |
| `/pages/contact` | اتصل بنا | `/admin/pages/contact` |
| `/pages/terms` | الشروط والسياسات | `/admin/pages/terms` |
| `/projects` | المشاريع | `GET /admin/projects` |
| `/projects/new` | إضافة مشروع | `POST /admin/projects` |
| `/projects/[id]` | تعديل مشروع | CRUD + gallery |
| `/services` | الخدمات | `GET /admin/services` |
| `/services/[id]` | تعديل خدمة | CRUD + media |
| `/media` | الصور والملفات | `/admin/media` |
| `/settings/site` | الشعار واسم الموقع | `/admin/settings/site` |
| `/settings/contact` | الهاتف والبريد والعنوان | `/admin/settings/contact_info` |
| `/settings/menu` | قائمة الموقع | `/admin/menus/main` + footer |
| `/settings/social` | حسابات التواصل | `/admin/settings/social` |
| `/settings/cta` | شريط تواصل معنا | `/admin/settings/cta` |
| `/settings/seo` | مظهر البحث في جوجل | `/admin/settings/seo` |

**Middleware:** protect all routes except `/login`; if no valid JWT → redirect `/login`.

---

## Layout & shell components

```
src/
  app/
    (auth)/login/page.tsx
    (dashboard)/
      layout.tsx              # RTL dir="rtl", Sidebar, TopBar
      overview/page.tsx
      pages/[pageKey]/page.tsx
      projects/...
      services/...
      media/page.tsx
      settings/[group]/page.tsx
  components/
    shell/
      Sidebar.tsx             # locked Arabic nav
      TopBar.tsx              # page title + language tabs + حفظ
      UpdateWebsiteButton.tsx # sticky/prominent
      LanguageTabs.tsx        # العربية | English
    forms/
      TextField.tsx
      RichTextField.tsx
      ImageField.tsx          # thumbnail + تغيير الصورة
      ImageGallery.tsx        # drag reorder + main photo star
      IconPicker.tsx
      PageLinkSelect.tsx      # dropdown of site pages, not raw paths
      RepeaterList.tsx        # bullets, cards, steps
    feedback/
      ConfirmDialog.tsx
      StatusPill.tsx          # ظاهر في الموقع / مخفي / في الرئيسية
      ToastMessages.tsx
  lib/
    api/client.ts             # fetch + JWT + base URL
    api/*.ts                  # typed endpoints
    auth/token.ts
    copy/ar.ts
    hooks/useUnsavedChanges.ts
```

### Shell UX rules

1. **Sidebar** always shows full nav from brainstorm §4.1.  
2. **تحديث الموقع الآن** visible in sidebar footer AND top bar on every authenticated screen.  
3. **LanguageTabs** on every content edit screen — switches `locale` query/body for API calls.  
4. **حفظ** is primary action top-right; disabled while saving.  
5. **عرض في الموقع** opens `PUBLIC_WEBSITE_URL/{locale}/...` in new tab.  
6. Unsaved changes → confirm dialog before navigation.

---

## Screen specifications (by phase)

### Page editors — section accordion pattern

Each page uses the same **PageEditor** shell:

- Left or top: section list with Arabic names (not API keys)  
- Right: active section form  
- Collapsed last section: **مظهر البحث في جوجل** (SEO fields)

| Page key | Sections shown to user (Arabic) |
|----------|----------------------------------|
| `home` | أعلى الصفحة (الصورة والعنوان) · خدماتنا (ملخص) · لماذا نحن · المشاريع المميزة (عناوين) · مظهر البحث |
| `about` | عنوان الصفحة · من نحن · رؤيتنا · رسالتنا · قيمنا · القطاعات · مظهر البحث |
| `services_index` | عنوان الصفحة · مظهر البحث · زر **تعديل قائمة الخدمات** |
| `projects_index` | عنوان الصفحة · مقدمة · مظهر البحث · زر **تعديل قائمة المشاريع** |
| `contact` | عنوان الصفحة · مقدمة · تسميات نموذج التواصل · ساعات العمل · مظهر البحث |
| `terms` | عنوان الصفحة · المحتوى · مظهر البحث |

**Note:** Contact **values** (phone, email) are under **بيانات الشركة → الهاتف والبريد والعنوان**, with help text: *«يُستخدم في كل أماكن ظهور بيانات التواصل في الموقع.»*

---

## Env vars (dashboard)

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
# JWT stored client-side after login; no secret in dashboard env
```

---

## Phased tasks

Implement in order. Dashboard phases assume matching API phases from `01-api-backend-plan.md` are available (or mocked).

---

### Phase 0 — Repo & project skeleton ✅ COMPLETE

**Goal:** Runnable Next.js app with RTL Arabic shell.

- [x] Create repo `golden-cms-dashboard`
- [x] Scaffold Next.js App Router + TypeScript + Tailwind
- [x] Add Cairo font, global `dir="rtl"` on `<html lang="ar">`
- [x] Create `lib/copy/ar.ts` with sidebar + common actions from glossary
- [x] Add `.env.example`, README (requires API URL)
- [x] Placeholder `(dashboard)/layout.tsx` with Sidebar mock links
- [x] Placeholder `/overview` with **ماذا تريد أن تعدّل؟**

**Done when:** `npm run dev` shows RTL Arabic sidebar locally.  
**Completed:** Phase 0 skeleton ships RTL Arabic shell on port 3001.

---

### Phase 1 — Design system & shell components ✅ COMPLETE

**Goal:** Reusable UI building blocks — calm, spacious, non-technical.

- [x] `Sidebar.tsx` — full locked nav tree
- [x] `TopBar.tsx` — title, `LanguageTabs`, **حفظ** button slot
- [x] `UpdateWebsiteButton.tsx` — with help text under button
- [x] `StatusPill.tsx`, `ConfirmDialog.tsx`, toast setup
- [x] Form primitives: `TextField`, `TextArea`, `Switch` (friendly labels)
- [x] Tailwind tokens: spacing, card, primary button, pill colors (green/gray/accent)
- [x] Empty state component with Arabic messages from glossary

**Done when:** static shell navigates between placeholder pages with correct Arabic labels.  
**Completed:** Phase 1 design system + placeholder routes navigate with Arabic labels.

---

### Phase 2 — API client & auth ✅ COMPLETE

**Goal:** Login and authenticated requests.

- [x] `lib/api/client.ts` — base URL, `Authorization: Bearer`, error parsing
- [x] `lib/auth/token.ts` — get/set/clear JWT
- [x] `/login` page — email + password, Arabic copy, call `POST /auth/login`
- [x] On success → store token → redirect `/overview`
- [x] On failure → **البريد الإلكتروني أو كلمة المرور غير صحيحة.**
- [x] Middleware: protect dashboard routes
- [x] `GET /auth/me` on app load to validate token
- [x] **تسجيل الخروج** clears token → `/login`
- [x] `mapApiError.ts` — no raw errors in UI

**Done when:** can log in against running API (or mock) and reach `/overview`.  
**Completed:** Phase 2 auth + API client; optional `NEXT_PUBLIC_USE_AUTH_MOCK` for UI without API.

---

### Phase 3 — Overview & «تحديث الموقع الآن» ✅ COMPLETE

**Goal:** Home screen + publish action wired.

- [x] `/overview` — shortcut cards (تعديل الصفحة الرئيسية · إضافة مشروع · تغيير رقم الهاتف)
- [x] Fetch project counts: visible vs hidden
- [x] Wire **تحديث الموقع الآن** → `POST /admin/publish/revalidate-website`
- [x] Success toast: **تم تحديث الموقع…**
- [x] Failure toast: **تم الحفظ هنا، لكن الموقع العام لم يتحدّث…**
- [x] Loading state on button: **جاري التحديث…**

**Done when:** button calls API and shows Arabic success/failure (mock OK until API Phase 9).  
**Completed:** Phase 3 overview counts + revalidate wired (mock via `NEXT_PUBLIC_USE_AUTH_MOCK`).

---

### Phase 4 — Shared page editor framework ✅ COMPLETE

**Goal:** One pattern for all fixed pages.

- [x] `PageEditor` layout: section accordion + `LanguageTabs` + **حفظ**
- [x] `usePageEditor(pageKey)` hook — TanStack Query get + patch mutation
- [x] `useUnsavedChanges` guard
- [x] Section registry: `pageKey → [{ key, titleAr, component }]`
- [x] SEO section component (collapsed): Google title + description + image
- [x] Save success toast **تم الحفظ**
- [x] Map API section payloads ↔ form default values per locale tab

**Done when:** framework works with one test page (home) end-to-end.  
**Completed:** Phase 4 page editor framework; `/pages/home` load/edit/save (mock or API).

---

### Phase 5 — Page editors (all fixed pages) ✅ COMPLETE

**Goal:** Every website page editable.

**Home (`/pages/home`):**
- [x] Sections: banner (title, subtitle, image, 2 buttons with `PageLinkSelect`), features list, why choose us, featured projects labels
- [x] Image fields use `ImageField` → media upload or picker

**About (`/pages/about`):**
- [x] about_us (text + image), vision, mission, values repeater, sectors repeater with enable switch
- [x] IconPicker for value/sector icons

**Services page intro (`/pages/services`):**
- [x] Title + SEO + prominent link card → `/services`

**Projects page intro (`/pages/projects`):**
- [x] Title, intro, SEO + link card → `/projects`

**Contact (`/pages/contact`):**
- [x] Intro, form labels, business hours — **not** phone/email values

**Terms (`/pages/terms`):**
- [x] Rich text body + SEO

**Done when:** all six page routes load/save both `ar` and `en` via API.  
**Completed:** Phase 5 all six page editors wired (mock or API); ImageField id entry until Phase 9 picker.

---

### Phase 6 — Projects list & create ✅ COMPLETE

**Goal:** Card-based project management — easiest path for editors.

**List (`/projects`):**
- [x] Card grid: cover, title, status pills
- [x] Search by title
- [x] Filters: **ظاهر في الموقع** / **مخفي** / **في الرئيسية**
- [x] **إضافة مشروع** → `/projects/new`
- [x] Card actions: **تعديل**, **عرض في الموقع**, toggle hide/show

**Create (`/projects/new`):**
- [x] Step-light flow on one page: name → photos → basics → description
- [x] Default **مخفي** after first save
- [x] **رابط الصفحة** under **المزيد من الخيارات**, auto-generated

**Done when:** list renders from API; create saves draft project.  
**Completed:** Phase 6 projects list/create; edit UI deferred to Phase 7 placeholder.

---

### Phase 7 — Project edit (full) ✅ COMPLETE

**Goal:** Richest editor — photos without folder names.

**Tabs:** **الأساسيات** | **الوصف** | **الصور** | **مظهر البحث في جوجل** (collapsed)

**Basics tab:**
- [x] title, client, location, year, service tags (simple tag input)
- [x] Switch **إظهار في الموقع** / **إظهار في الصفحة الرئيسية**
- [x] Warning if featured count > 3 (fetch count or API warning)
- [x] **حفظ** + optional **إظهار في الموقع** action

**Description tab:**
- [x] Rich text **نص منسّق**

**Photos tab:**
- [x] `ImageGallery`: upload, drag reorder, set **الصورة الرئيسية**
- [x] Optional **وصف قصير للصورة** per image (side panel)
- [x] Upload shows **جاري رفع الصورة…**

**Actions:**
- [x] **عرض في الموقع** → `{WEBSITE_URL}/{locale}/projects/{slug}`
- [x] **إخفاء من الموقع** (primary soft action)
- [x] **حذف** with confirm: **هل أنت متأكد من الحذف؟…**

**Done when:** full project lifecycle: create hidden → add gallery → show on website → update website now.  
**Completed:** Phase 7 full project editor with TipTap + dnd gallery.

---

### Phase 8 — Services list & edit ✅ COMPLETE

**Goal:** Three services — one screen each, plain tabs.

**List (`/services`):**
- [x] Simple cards (image, title, status)
- [x] **تعديل** only (no create in v1 if API keeps fixed 3 — or hide **إضافة خدمة**)

**Edit (`/services/[id]`):**
- [x] Tab **بطاقة صفحة الخدمات**: title, description, details list, image, photo left/right
- [x] Tab **صفحة الخدمة الكاملة**: banner, introduction, scope items, standards, methodology steps
- [x] Tab **الصور**: gallery like projects
- [x] Show/hide on website toggles

**Done when:** all 3 seeded services editable in AR/EN.  
**Completed:** Phase 8 services list + 3-tab editor (mock or API).

---

### Phase 9 — Photos & files library ✅ COMPLETE

**Goal:** Standalone media management.

- [x] `/media` — grid of thumbnails
- [x] **إضافة صورة** upload (multipart to API)
- [x] Search/filter optional
- [x] Click image → side panel: preview, **وصف قصير للصورة** (AR/EN tabs), **حذف** if unused
- [x] Never display disk path — filename only if needed

**Done when:** upload from library works; images selectable from `ImageField` modal picker.  
**Completed:** Phase 9 media library + ImageField / SingleImageUpload picker modal.

---

### Phase 10 — Company info & settings ✅ COMPLETE

**Goal:** Global values in friendly sub-screens.

**الشعار واسم الموقع:**
- [x] Logo, favicon, site name (AR/EN tabs for text fields)

**الهاتف والبريد والعنوان:**
- [x] phone, email, WhatsApp, address AR/EN, tax, commercial register
- [x] Help: *«يُستخدم في كل أماكن ظهور بيانات التواصل في الموقع.»*

**قائمة الموقع:**
- [x] Two blocks: **قائمة أعلى الموقع** / **قائمة أسفل الموقع**
- [x] Fixed 5 items — edit **label** (AR/EN tab) + **order** only; href read-only or hidden
- [x] No add/remove links in v1

**حسابات التواصل:**
- [x] Platform name + URL fields

**شريط تواصل معنا:**
- [x] Enable switch, title, body, button labels (AR/EN tabs)

**مظهر البحث في جوجل:**
- [x] Default meta title, description, image

**Done when:** changing phone in settings persists via API.  
**Completed:** Phase 10 settings groups + menu editor (mock or API).

---

### Phase 11 — Polish, guards & handoff ✅ COMPLETE

**Goal:** Safe, trustworthy experience for non-technical staff.

- [x] Unsaved changes dialog on all edit screens
- [x] Disable **إظهار في الموقع** if required fields empty — inline **يرجى إضافة…**
- [x] All loading states in Arabic (**جاري الحفظ…**, **جاري التحميل…**)
- [x] 401 → logout + redirect login with friendly message
- [x] Tablet pass: sidebar collapsible, touch targets ≥ 44px
- [x] README: setup, env, login credentials (from API seed), editor workflow diagram
- [x] Short **دليل المستخدم** (1-page PDF or markdown in repo) in Arabic for staff
- [x] Smoke checklist (see below — also mirrored in user guide)

**Done when:** non-developer can follow Arabic guide and edit home + one project without help.  
**Completed:** Phase 11 polish, guards, README, and `docs/guides/user-guide-ar.md`.

---

## Suggested implementation order (summary)

```
0 Skeleton → 1 Design system → 2 Auth → 3 Overview + revalidate
    → 4 Page editor framework → 5 All pages
    → 6 Projects list/create → 7 Project edit
    → 8 Services → 9 Media library → 10 Settings → 11 Polish
```

**Parallel note:** Phases 6–8 can overlap after Phase 5 if two developers; Phase 9 (media picker) should exist before Phase 7 is fully polished.

---

## API dependency matrix

| Dashboard phase | Requires API phase |
|-----------------|-------------------|
| 2 Auth | API Phase 2 |
| 3 Revalidate | API Phase 9 |
| 4–5 Pages | API Phase 5 + 8 (public not required) |
| 6–7 Projects | API Phase 6 + 3 (media) |
| 8 Services | API Phase 6 |
| 9 Media | API Phase 3 |
| 10 Settings | API Phase 7 |

During API development, use **mock handlers** or MSW for dashboard UI work.

---

## Acceptance criteria (dashboard v1 complete)

1. Separate Next.js repo; Arabic RTL UI throughout.  
2. Login with JWT; protected routes.  
3. All fixed pages editable via section accordions + `العربية` / `English` tabs.  
4. Projects: card list, create, edit, photo gallery reorder, show/hide, delete with confirm.  
5. Services: edit card + detail + photos for all 3 services.  
6. Media library upload + picker integration.  
7. Settings: logo, contact, menu labels/order, social, CTA band, SEO defaults.  
8. **تحديث الموقع الآن** works with clear Arabic feedback.  
9. No developer jargon, paths, or raw errors visible to users.  
10. Copy lives in `lib/copy/ar.ts` per glossary.

---

## Smoke test checklist (Arabic QA)

- [ ] تسجيل الدخول / تسجيل الخروج  
- [ ] تعديل عنوان الصفحة الرئيسية (العربية ثم English) → حفظ → تم الحفظ  
- [ ] تغيير صورة في من نحن  
- [ ] إضافة مشروع مخفي → رفع 3 صور → ترتيب → صورة رئيسية  
- [ ] إظهار في الموقع → تحديث الموقع الآن → عرض في الموقع  
- [ ] تغيير رقم الهاتف في الإعدادات  
- [ ] تعديل تسمية عنصر في قائمة الموقع  
- [ ] رسالة خطأ واضحة عند فشل الحفظ (simulate offline)

---

## User guide outline (deliver in Phase 11)

One-page Arabic guide for staff:

1. كيف تسجّل الدخول  
2. كيف تعدّل صفحة  
3. كيف تضيف مشروعاً  
4. الفرق بين **حفظ** و **إظهار في الموقع** و **تحديث الموقع الآن**  
5. أين تغيّر الهاتف والبريد  
6. من تتصل عند وجود مشكلة  

---

## Dependencies on other repos

| Repo | Needs from dashboard |
|------|----------------------|
| API | CORS allows dashboard origin; admin routes stable |
| Public website | `POST /api/revalidate` + `PUBLIC_WEBSITE_URL` for preview links |

When this plan is approved, implementation starts at **Phase 0** in the new dashboard repository.
