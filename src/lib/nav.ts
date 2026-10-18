import { copy } from "@/lib/copy/ar";

export type NavItem = {
  href: string;
  label: string;
};

export type BreadcrumbItem = {
  href?: string;
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
  "/services/new": copy.addService,
  "/media": copy.nav.media,
  ...Object.fromEntries(websitePageLinks.map((i) => [i.href, i.label])),
  ...Object.fromEntries(settingsLinks.map((i) => [i.href, i.label])),
};

export function getPageTitle(pathname: string): string {
  if (titleByPath[pathname]) return titleByPath[pathname];
  if (pathname.startsWith("/projects/")) return copy.editProject;
  if (pathname.startsWith("/services/")) return copy.editService;
  return copy.appTitle;
}

/**
 * Trail for navigating back to parent screens.
 * Last item is the current page (no href).
 */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const home: BreadcrumbItem = { href: "/overview", label: copy.overview };

  if (pathname === "/overview") {
    return [{ label: copy.overview }];
  }

  if (pathname === "/services") {
    return [home, { label: copy.nav.services }];
  }
  if (pathname === "/services/new") {
    return [
      home,
      { href: "/services", label: copy.nav.services },
      { label: copy.addService },
    ];
  }
  if (/^\/services\/[^/]+$/.test(pathname)) {
    return [
      home,
      { href: "/services", label: copy.nav.services },
      { label: copy.editService },
    ];
  }

  if (pathname === "/projects") {
    return [home, { label: copy.nav.projects }];
  }
  if (pathname === "/projects/new") {
    return [
      home,
      { href: "/projects", label: copy.nav.projects },
      { label: copy.addProject },
    ];
  }
  if (/^\/projects\/[^/]+$/.test(pathname)) {
    return [
      home,
      { href: "/projects", label: copy.nav.projects },
      { label: copy.editProject },
    ];
  }

  if (pathname === "/media") {
    return [home, { label: copy.nav.media }];
  }

  const pageLink = websitePageLinks.find((i) => i.href === pathname);
  if (pageLink) {
    return [
      home,
      { label: copy.nav.websitePages },
      { label: pageLink.label },
    ];
  }

  const settingsLink = settingsLinks.find((i) => i.href === pathname);
  if (settingsLink) {
    return [
      home,
      { label: copy.nav.companySettings },
      { label: settingsLink.label },
    ];
  }

  return [home, { label: getPageTitle(pathname) }];
}

/** Routes that show language tabs + save in the top bar. */
export function isEditorRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/pages/") ||
    pathname.startsWith("/settings/") ||
    pathname === "/projects/new" ||
    pathname === "/services/new" ||
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
