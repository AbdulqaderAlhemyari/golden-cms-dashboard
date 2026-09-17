# Brainstorm: CMS Dashboard (React + Next.js)

> **Purpose:** Ideas for a content management UI focused on text and images — not a full website builder.  
> **Scope:** Edit content for existing pages/sections; manage projects and media.  
> **Priority:** UI/UX and wording must feel simple for **non-technical** editors (office / marketing users, not developers).  
> **Related:** `01-api-backend.md`, `03-website-dynamic-migration.md`

---

## 1. Product vision

A small internal dashboard where an editor can:

1. See **all website pages** in the left menu (like a table of contents).  
2. Open a page and edit **each part of the page** (titles, paragraphs, buttons, photos).  
3. Manage **Projects** (list + details + photo gallery).  
4. Manage **Services** text and photos.  
5. Edit shared company info: phone, logo, menu labels, footer message, “call us” band.  
6. Switch **Arabic / English website text** while editing (public site default is Arabic).

They should **not** be able to: invent new page layouts, change the design system, change animations, or break the website structure.

**Audience assumption:** users may never have used a “CMS.” They know the Golden Quality website, not APIs, JSON, slugs, or ISR. Every screen should sound like editing the website — not operating a developer tool.

---

## 2. Non-technical UX & terminology (design law)

This section is a hard constraint for the future implementation plan.

### 2.1 Principles

1. **Speak website language, not tech language** — labels match what visitors see (“Home page”, “Big title”, “Photo”), not CMS jargon.  
2. **Hide internals** — never show file paths, folder names, IDs, JSON, tokens, “endpoints”, “revalidate”, “payload”, “locale codes” as primary UI.  
3. **One clear action** — primary buttons use everyday verbs: Save, Show on website, Update website now, Add photo, Add project.  
4. **Short help under hard fields** — one plain sentence under anything confusing (“This photo appears at the top of the Home page”).  
5. **Safe by default** — confirm before delete; warn before “Show on website” if required fields are empty; never require typing a URL path when a dropdown of site pages works.  
6. **Arabic-first chrome (locked)** — all dashboard menus/buttons in **Arabic**. Website content still edited via **العربية | English** tabs. Optional English UI chrome can wait for a later version.  
7. **One content language at a time (locked)** — tabs switch the whole form between Arabic and English website text (not side-by-side in v1).  
8. **Show, don’t theorize** — prefer thumbnails, “عرض في الموقع”, and section names that match the live page order.  
9. **Progressive disclosure** — advanced bits sit under **المزيد من الخيارات** / **مظهر البحث في جوجل**.

### 2.2 Locked product decisions

| Decision | Choice |
|----------|--------|
| Dashboard UI language | **Arabic first** |
| Content language editing | **One tab at a time** (`العربية` \| `English`) |
| Arabic labels | **Locked glossary below** (aligned with live site menu wording where possible) |

### 2.3 Glossary — Arabic UI (source of truth for implementation)

Page names follow the public site menu (`الرئيسية`, `من نحن`, `خدماتنا`, `مشاريعنا`, `اتصل بنا`).

#### Product & shell

| Meaning (EN) | Arabic label (UI) |
|--------------|-------------------|
| App title | **غولدن كواليتي — إدارة محتوى الموقع** |
| Sign in | **تسجيل الدخول** |
| Sign-in subtitle | **سجّل الدخول لتعديل محتوى الموقع** |
| Email | **البريد الإلكتروني** |
| Password | **كلمة المرور** |
| Sign out | **تسجيل الخروج** |
| Editor home / overview | **الرئيسية** |
| Overview prompt | **ماذا تريد أن تعدّل؟** |

#### Sidebar

| Meaning (EN) | Arabic label (UI) |
|--------------|-------------------|
| Website pages | **صفحات الموقع** |
| Home page | **الرئيسية** |
| About page | **من نحن** |
| Services page (intro) | **صفحة الخدمات** |
| Projects page (intro) | **صفحة المشاريع** |
| Contact page | **اتصل بنا** |
| Terms & policy | **الشروط والسياسات** |
| Projects (list) | **المشاريع** |
| Services (list) | **الخدمات** |
| Photos & files | **الصور والملفات** |
| Company info & settings | **بيانات الشركة والإعدادات** |
| Logo & site name | **الشعار واسم الموقع** |
| Phone, email & address | **الهاتف والبريد والعنوان** |
| Website menu | **قائمة الموقع** |
| Social links | **حسابات التواصل** |
| Site-wide contact band | **شريط تواصل معنا** |
| Search appearance (Google) | **مظهر البحث في جوجل** |
| Update website now | **تحديث الموقع الآن** |

#### Common actions & status

| Meaning (EN) | Arabic label (UI) |
|--------------|-------------------|
| Save | **حفظ** |
| Saving… | **جاري الحفظ…** |
| Saved | **تم الحفظ** |
| Cancel | **إلغاء** |
| Delete | **حذف** |
| Confirm delete | **هل أنت متأكد من الحذف؟ لا يمكن التراجع بسهولة.** |
| Add photo | **إضافة صورة** |
| Change photo | **تغيير الصورة** |
| Remove photo | **إزالة الصورة** |
| Add project | **إضافة مشروع** |
| Add service | *(if needed)* **إضافة خدمة** |
| Edit | **تعديل** |
| View on website | **عرض في الموقع** |
| Show on website | **إظهار في الموقع** |
| Hide from website | **إخفاء من الموقع** |
| On website (status) | **ظاهر في الموقع** |
| Hidden (status) | **مخفي** |
| Show on Home page | **إظهار في الصفحة الرئيسية** |
| On Home page (badge) | **في الرئيسية** |
| Main photo | **الصورة الرئيسية** |
| Photos (gallery tab) | **الصور** |
| Basics | **الأساسيات** |
| Description | **الوصف** |
| More options | **المزيد من الخيارات** |
| Website address (slug) | **رابط الصفحة** |
| Website address help | **يُستخدم في عنوان الصفحة على الإنترنت. يُملأ تلقائياً من الاسم.** |
| Arabic content tab | **العربية** |
| English content tab | **English** |
| Photo on the left | **الصورة على اليسار** |
| Photo on the right | **الصورة على اليمين** |
| Edit services list | **تعديل قائمة الخدمات** |
| Edit projects list | **تعديل قائمة المشاريع** |
| Short photo description | **وصف قصير للصورة** |
| Formatted text (no “markdown”) | **نص منسّق** |

#### Revalidate help

| Meaning (EN) | Arabic copy |
|--------------|-------------|
| Button | **تحديث الموقع الآن** |
| Help under button | **بعد الانتهاء من التعديل والحفظ، اضغط هنا ليظهر الزوار آخر التغييرات على الموقع.** |
| Success | **تم تحديث الموقع. يمكنك الآن مراجعة الصفحات على الموقع.** |
| Failure | **تم الحفظ هنا، لكن الموقع العام لم يتحدّث. حاول مرة أخرى أو تواصل مع الدعم.** |

#### Empty states & errors (Arabic)

| Situation | Arabic message |
|-----------|----------------|
| No projects | **لا توجد مشاريع بعد. أضف أول مشروع.** |
| Save failed | **تعذّر الحفظ. تحقق من الاتصال بالإنترنت ثم حاول مرة أخرى.** |
| Missing main photo | **يرجى إضافة صورة رئيسية قبل إظهار هذا المحتوى في الموقع.** |
| Wrong login | **البريد الإلكتروني أو كلمة المرور غير صحيحة.** |
| Unsaved changes | **لديك تغييرات غير محفوظة. هل تريد المغادرة دون حفظ؟** |
| Featured > 3 warning | **الصفحة الرئيسية تعرض عادةً حتى ٣ مشاريع. يمكنك المتابعة، لكن قد يظهر عدد أكبر من المعتاد.** |

### 2.4 Plain workflow (user mental model)

```
1. اختر ماذا تعدّل (صفحة، مشروع، رقم الهاتف، …)
2. عدّل النصوص / الصور
3. اضغط «حفظ»
4. إن لزم: «إظهار في الموقع» (للمشاريع والخدمات)
5. اضغط «تحديث الموقع الآن» ليراه الزوار
```

Do **not** teach “deploy”, “cache”, or “revalidate” in the UI.

### 2.5 Errors — rule

No stack traces, status codes, or developer jargon in the UI. Map API/Zod errors to the Arabic messages above.

### 2.6 Visual simplicity

- Large clickable rows; comfortable spacing; clear primary button per screen.  
- Avoid dense data tables with many columns — use simple cards for projects (photo + title + status).  
- Status as friendly pills: **ظاهر في الموقع** (green), **مخفي** (gray), **في الرئيسية** (accent).  
- Icons only when they clarify; every icon has a text label.  
- Full **RTL** chrome; desktop-first OK, but touch targets should still be large (tablet-friendly).

---

## 3. How this maps to the current website

(Dev mapping only — **not** shown to editors.)

| User-facing name | Today’s source |
|------------------|----------------|
| Home page | `content/*/home` |
| About page | `content/*/pages.about` |
| Services page (intro) | `content/*/pages.services` |
| Services list | cards + `serviceDetails.*` |
| Projects page (intro) | `projectsIndex` |
| Projects list | `projects.*` + image folders |
| Contact page | `pages.contact` + `config.contact_info` |
| Terms page | `pages.terms-policy` |
| Company info & settings | `config.json`, menus, social |

The dashboard is a **friendly editor over that model**, backed by the API instead of JSON files.

---

## 4. IA (information architecture) — user-facing labels

### 4.1 Primary nav (sidebar) — locked Arabic

```
الرئيسية                          ← editor overview
────────────
صفحات الموقع
  ├─ الرئيسية
  ├─ من نحن
  ├─ صفحة الخدمات      → + زر «تعديل قائمة الخدمات»
  ├─ صفحة المشاريع     → + زر «تعديل قائمة المشاريع»
  ├─ اتصل بنا
  └─ الشروط والسياسات
────────────
المشاريع
الخدمات
────────────
الصور والملفات
────────────
بيانات الشركة والإعدادات
  ├─ الشعار واسم الموقع
  ├─ الهاتف والبريد والعنوان
  ├─ قائمة الموقع
  ├─ حسابات التواصل
  ├─ شريط تواصل معنا
  └─ مظهر البحث في جوجل
────────────
تحديث الموقع الآن               ← always visible, prominent
تسجيل الخروج
```

RTL layout for the whole dashboard chrome. Content fields follow the active tab (`العربية` or `English`).

**Idea:** under صفحات الموقع → صفحة المشاريع, editors change title/intro only; big button **تعديل قائمة المشاريع** opens the projects list. Same for services.

### 4.2 Overview home

Not analytics — **ماذا تريد أن تعدّل؟**

- Shortcut cards: **تعديل الصفحة الرئيسية** · **إضافة مشروع** · **تغيير رقم الهاتف**  
- Status: **١٢ مشروعاً ظاهراً · ١ مخفي**  
- Content language reminder uses the tabs on edit screens  
- Last saved: **تم الحفظ قبل ٥ دقائق**  

---

## 5. Page editor UX ideas

### 5.1 Layout (human section names)

```
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │  About us     [ العربية | English ]  [Save] │
│          ├─────────────────────────────────────────────┤
│          │  ○ Top of page (title)                      │
│          │  ○ Who we are                               │
│          │  ○ Vision / Mission                         │
│          │  ○ Values                                   │
│          │  ○ Sectors we serve                         │
│          │  ○ Search appearance (optional / collapsed) │
│          │                                             │
│          │  [simple fields + “Change photo”]           │
└──────────┴─────────────────────────────────────────────┘
```

- Section names match the **live website**, not developer keys.  
- One part of the page at a time (accordion or side list) — no endless wall of fields.  
- Language: tabs labeled **العربية** / **English**, never `ar` / `en`.  
- Prefer **one language at a time** for non-technical users (simpler). Optional later: side-by-side for translators.

### 5.2 Field types (editor experience)

| What the user does | UI |
|--------------------|-----|
| Short line | Normal text box with a clear label |
| Long text | Simple formatted editor (bold, lists) — no “Markdown” label |
| Photo | Thumbnail + **Change photo** / **Remove photo** |
| Bullet list | “Add another line” buttons |
| Cards (services teaser, values…) | Mini-cards with Edit; not raw JSON arrays |
| On / off | Friendly switches: “Show this block”, “Show on Home page” |
| Icon | Visual icon picker with Arabic/English names, not `zap` |
| Button link | Dropdown of site pages (“Services”, “Contact”) instead of typing `/services` |
| Photo gallery | Drag to reorder; “Main photo” star |

### 5.3 Constraints (keep editors safe)

- Cannot add/remove whole section *types* on Home/About.  
- Icons from a fixed visual picker.  
- Links mostly from a page list; advanced “custom link” behind “More options”.  
- If more than 3 projects marked “Show on Home page”, show a plain warning: “Home usually shows up to 3 projects.”

---

## 6. Projects experience (priority)

Projects are the richest content — and must stay the easiest.

### List view

- **Cards**, not a dense spreadsheet: photo, title, status (**On website** / **Hidden**), optional “On Home page” badge  
- Search by name; simple filters: “On website”, “Hidden”, “On Home page”  
- Actions in plain words: **Edit**, **Add project**, **View on website**, **Delete** (with confirm)

### Edit project (tabs in plain language)

1. **Basics** — name, client, location, year, tags, “Show on Home page”, “Show on website”  
2. **Description** — project story (formatted text)  
3. **Photos** — add, drag-reorder, choose main photo, short photo description (optional)  
4. **Search appearance** — collapsed/advanced  

**Link name (slug):** auto from title; show as small “Website address” preview; editable under “More options” so beginners don’t touch it.

**Photos:** never ask for folder names. Only “Add photos” and drag to reorder.

### Add project flow (wizard-light)

1. Project name  
2. Add photos  
3. Fill basic facts + description  
4. **Save** (starts as **Hidden**) → user clicks **Show on website** when ready → **Update website now**

---

## 7. Services experience

Same plain language as projects.

- One screen per service with tabs: **Card on Services page** | **Full service page** | **Photos**  
- “Photo on the left / right” instead of `image_side`  
- Avoid “methodology array” — label steps “How we work — step 1, step 2…”

---

## 8. Photos & files

- Big **Add photos** button; grid of thumbnails  
- Search by name if useful  
- Edit short description (AR/EN) in a calm side panel  
- Never show disk paths like `golden quality images/...`

---

## 9. Company info & settings

| User-facing screen | What they edit |
|--------------------|----------------|
| Logo & site name | Logo, favicon, company name on site |
| Phone, email & address | All contact values (one place for the whole site) |
| Website menu | Labels + order for header/footer (keep structure simple) |
| Social links | Facebook, LinkedIn, … URLs |
| “Contact us” band | Site-wide bottom invitation text & buttons |
| Search appearance | Default Google title/description/image |

**Contact page** text (form labels, intro) stays under **Website pages → Contact**.  
**Phone/email/address values** stay under **Company info** — explain with one line: “Used everywhere contact details appear.”

---

## 10. Auth & roles (v1)

- One admin login (email + password).  
- Login screen copy: “Sign in to edit the website” — not “Authenticate to CMS”.  
- No self-registration.  
- JWT under the hood; user only sees Sign in / Sign out.

---

## 11. Tech brainstorm (Next.js) — still separate from user language

| Concern | Ideas |
|---------|--------|
| App | Next.js App Router + TypeScript (separate repo) |
| UI | Calm, spacious Tailwind UI — readable Arabic typography (e.g. Cairo) |
| Forms | React Hook Form + Zod (errors mapped to plain Arabic/English messages) |
| Data | Admin REST + JWT; React Query / SWR |
| Uploads | Progress: “Uploading photo…” |
| **Dashboard language** | **Arabic UI locked**; content tabs `العربية` \| `English` (one at a time) |
| Preview | Button **View on website** |

Dev terms stay in code/README only — never in the product UI.

---

## 12. Editorial workflow (plain)

| Step | User words |
|------|------------|
| Save | **Save** — stores changes in the content system |
| Visibility | **Show on website** / **Hide from website** (projects & services) |
| Go live for visitors | **Update website now** (after saves; explains refresh in one sentence) |
| Mistakes | Inline “Please fill this in”; confirm deletes |
| Leaving with edits | “You have unsaved changes. Leave without saving?” |

Prefer **explicit Save** over mysterious autosave for this audience (clearer mental model). Optional “Saved ✓” toast.

---

## 13. What success looks like (non-technical test)

A staff member with **no developer help** can:

- Change the Home page title and main photo in Arabic and English  
- Add a project with several photos and show it on the website  
- Change the company phone once and trust it updates everywhere  
- Press **Update website now** and see the live site match  

They never need to know: JSON, folders, API, cache, JWT, slug, markdown, or repo structure.

They cannot:

- Break page structure / redesign the site  
- See developer error dumps  

---

## 14. Open questions before implementation plan

**Locked:**
1. Arabic-first dashboard chrome — **yes**  
2. One content language tab at a time — **yes**  
3. Arabic nav/action glossary — **drafted in §2.3** (aligned with live menu: الرئيسية، من نحن، الخدمات، المشاريع، اتصل بنا)

**Still open:**
4. Terms page in v1?  
5. Delete project: remove forever vs hide-only for v1?  
6. Website menu: edit labels/order only, or also add/remove links?  
7. Desktop-only vs must work on iPad?

---

## 15. Next step

Implementation plan for the dashboard should use **§2.3 Arabic glossary** as the UI copy source, RTL chrome, single language tab, and REST/JWT against `01-api-backend-plan.md`.
