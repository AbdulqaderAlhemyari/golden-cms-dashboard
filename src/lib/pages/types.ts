/** API page keys (may differ from dashboard route segments). */
export type ApiPageKey =
  | "home"
  | "about"
  | "services_index"
  | "projects_index"
  | "contact"
  | "terms";

/** Dashboard route segment under /pages/[pageKey] */
export type RoutePageKey =
  | "home"
  | "about"
  | "services"
  | "projects"
  | "contact"
  | "terms";

export const routeToApiPageKey: Record<RoutePageKey, ApiPageKey> = {
  home: "home",
  about: "about",
  services: "services_index",
  projects: "projects_index",
  contact: "contact",
  terms: "terms",
};

export function isRoutePageKey(value: string): value is RoutePageKey {
  return value in routeToApiPageKey;
}

export type ContentLocale = "ar" | "en";

export type MediaRef =
  | string
  | {
      id: string;
      url?: string;
    }
  | null;

export type PageSections = Record<string, unknown>;

export type PageResponse = {
  key: ApiPageKey;
  locale: ContentLocale;
  sections: PageSections;
};
