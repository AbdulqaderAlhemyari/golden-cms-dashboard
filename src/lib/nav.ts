import { copy } from "@/lib/copy/ar";

export type NavItem = {
  href: string;
  label: string;
};

export const websitePageLinks: NavItem[] = [
  { href: "/pages/home", label: copy.nav.homePage },
  { href: "/pages/about", label: copy.nav.aboutPage },
  { href: "/pages/services", label: copy.nav.servicesPage },
  { href: "/pages/projects", label: copy.nav.projectsPage },
  { href: "/pages/contact", label: copy.nav.contactPage },
  { href: "/pages/terms", label: copy.nav.termsPage },
];

export const settingsLinks: NavItem[] = [
  { href: "/settings/site", label: copy.nav.siteLogo },
  { href: "/settings/contact", label: copy.nav.contactInfo },
  { href: "/settings/menu", label: copy.nav.websiteMenu },
  { href: "/settings/social", label: copy.nav.socialLinks },
  { href: "/settings/cta", label: copy.nav.ctaBand },
  { href: "/settings/seo", label: copy.nav.seoAppearance },
];

const titleByPath: Record<string, string> = {
  "/overview": copy.overview,
  "/projects": copy.nav.projects,
  "/projects/new": copy.addProject,
  "/services": copy.nav.services,
  "/media": copy.nav.media,
  ...Object.fromEntries(websitePageLinks.map((i) => [i.href, i.label])),
  ...Object.fromEntries(settingsLinks.map((i) => [i.href, i.label])),
};

export function getPageTitle(pathname: string): string {
  if (titleByPath[pathname]) return titleByPath[pathname];
  if (pathname.startsWith("/projects/")) return copy.edit;
  if (pathname.startsWith("/services/")) return copy.edit;
  return copy.appTitle;
}

/** Routes that show language tabs + save in the top bar. */
export function isEditorRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/pages/") ||
    pathname.startsWith("/settings/") ||
    pathname === "/projects/new" ||
    /^\/projects\/[^/]+$/.test(pathname) ||
    /^\/services\/[^/]+$/.test(pathname)
  );
}

export const pageKeys = [
  "home",
  "about",
  "services",
  "projects",
  "contact",
  "terms",
] as const;

export type PageKey = (typeof pageKeys)[number];

export const settingsGroups = [
  "site",
  "contact",
  "menu",
  "social",
  "cta",
  "seo",
] as const;

export type SettingsGroup = (typeof settingsGroups)[number];
