import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";

export type MenuLocation = "main" | "footer";

export type MenuItem = {
  label: string;
  href: string;
  sortOrder?: number;
};

export type MenusBothLocales = {
  location: MenuLocation;
  items: {
    ar: MenuItem[];
    en: MenuItem[];
  };
};

const defaultItems = (locale: "ar" | "en"): MenuItem[] =>
  locale === "ar"
    ? [
        { label: "الرئيسية", href: "/" },
        { label: "من نحن", href: "/about" },
        { label: "خدماتنا", href: "/services" },
        { label: "مشاريعنا", href: "/projects" },
        { label: "اتصل بنا", href: "/contact" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Projects", href: "/projects" },
        { label: "Contact", href: "/contact" },
      ];

const mockMenus: Record<MenuLocation, { ar: MenuItem[]; en: MenuItem[] }> = {
  main: { ar: defaultItems("ar"), en: defaultItems("en") },
  footer: { ar: defaultItems("ar"), en: defaultItems("en") },
};

export async function getMenu(location: MenuLocation): Promise<MenusBothLocales> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 120));
    return {
      location,
      items: structuredClone(mockMenus[location]),
    };
  }

  return apiFetch<MenusBothLocales>(`/admin/menus/${location}`, {
    method: "GET",
  });
}

export async function putMenu(
  location: MenuLocation,
  items: { ar?: MenuItem[]; en?: MenuItem[] },
): Promise<MenusBothLocales> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 200));
    if (items.ar) mockMenus[location].ar = items.ar;
    if (items.en) mockMenus[location].en = items.en;
    return {
      location,
      items: structuredClone(mockMenus[location]),
    };
  }

  await apiFetch(`/admin/menus/${location}`, {
    method: "PUT",
    body: items,
  });
  return getMenu(location);
}
