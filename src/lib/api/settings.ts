import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";
import type { MediaRef } from "@/lib/pages/types";

export type ApiSettingGroup =
  | "site"
  | "contact_info"
  | "cta"
  | "seo"
  | "social"
  | "pagination";

export type Bilingual = { ar?: string; en?: string };

export type SiteSettings = {
  title?: Bilingual;
  logo_text?: Bilingual;
  footer_content?: Bilingual;
  copyright?: Bilingual;
  base_url?: string;
  logo?: MediaRef;
  favicon?: MediaRef;
  logo_width?: string | number;
  logo_height?: string | number;
};

export type ContactSettings = {
  phone?: string;
  phone_link?: string;
  email?: string;
  whatsapp?: string;
  location?: Bilingual;
  tax_number?: string;
  commercial_register?: string;
};

export type CtaLocaleBlock = {
  title?: string;
  body?: string;
  button_label?: string;
  button_href?: string;
};

export type CtaSettings = {
  enable?: boolean;
  ar?: CtaLocaleBlock;
  en?: CtaLocaleBlock;
};

export type SeoSettings = {
  meta_title?: string;
  meta_author?: string;
  meta_description?: string;
  meta_image?: MediaRef;
};

export type SocialSettings = Record<string, string>;

export type SettingsResponse<T = Record<string, unknown>> = {
  key: string;
  value: T;
  updatedAt?: string;
};

const mockStore: Record<string, Record<string, unknown>> = {
  site: {
    title: { ar: "غولدن كواليتي", en: "Golden Quality" },
    logo_text: { ar: "غولدن كواليتي", en: "Golden Quality" },
    footer_content: {
      ar: "نص تذييل الموقع",
      en: "Footer content",
    },
    copyright: {
      ar: "جميع الحقوق محفوظة",
      en: "All rights reserved",
    },
    logo: null,
    favicon: null,
  },
  contact_info: {
    phone: "+966 11 000 0000",
    phone_link: "tel:+966110000000",
    email: "info@goldenquality.sa",
    whatsapp: "+966500000000",
    location: {
      ar: "الرياض، المملكة العربية السعودية",
      en: "Riyadh, Saudi Arabia",
    },
    tax_number: "",
    commercial_register: "",
  },
  cta: {
    enable: true,
    ar: {
      title: "تواصل معنا",
      body: "فريقنا جاهز لمساعدتك.",
      button_label: "اتصل بنا",
      button_href: "/contact",
    },
    en: {
      title: "Contact us",
      body: "Our team is ready to help.",
      button_label: "Contact",
      button_href: "/contact",
    },
  },
  seo: {
    meta_title: "Golden Quality",
    meta_author: "Golden Quality",
    meta_description: "Inspection and certification services",
    meta_image: null,
  },
  social: {
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/",
    twitter: "",
    instagram: "",
  },
};

export async function getSettingsGroup<T = Record<string, unknown>>(
  group: ApiSettingGroup,
): Promise<SettingsResponse<T>> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    return {
      key: group,
      value: structuredClone(mockStore[group] ?? {}) as T,
      updatedAt: new Date().toISOString(),
    };
  }

  return apiFetch<SettingsResponse<T>>(`/admin/settings/${group}`, {
    method: "GET",
  });
}

export async function patchSettingsGroup<T = Record<string, unknown>>(
  group: ApiSettingGroup,
  patch: Record<string, unknown>,
): Promise<SettingsResponse<T>> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 250));
    mockStore[group] = { ...(mockStore[group] ?? {}), ...patch };
    return {
      key: group,
      value: structuredClone(mockStore[group]) as T,
      updatedAt: new Date().toISOString(),
    };
  }

  return apiFetch<SettingsResponse<T>>(`/admin/settings/${group}`, {
    method: "PATCH",
    body: patch,
  });
}

/** Dashboard route segment → API settings key (`menu` is handled separately). */
const routeToApiGroup: Record<string, ApiSettingGroup> = {
  site: "site",
  contact: "contact_info",
  social: "social",
  cta: "cta",
  seo: "seo",
};

export function settingsRouteToApiGroup(
  route: string,
): ApiSettingGroup | null {
  return routeToApiGroup[route] ?? null;
}
