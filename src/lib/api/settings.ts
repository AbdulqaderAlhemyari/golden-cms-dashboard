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

/** Matches seeded `call_to_action` / public settings CTA shape (exactly 2 buttons). */
export type CtaLocaleBlock = {
  title?: string;
  content?: string;
  contact_label?: string;
  whatsapp_label?: string;
};

export type CtaSettings = {
  enable?: boolean;
  ar?: CtaLocaleBlock;
  en?: CtaLocaleBlock;
};

export type SeoSettings = {
  meta_title?: Bilingual;
  meta_author?: Bilingual;
  meta_description?: Bilingual;
  meta_image?: MediaRef;
};

function asBilingual(value: unknown): Bilingual {
  if (typeof value === "string") {
    // Legacy admin payloads stored a single shared string — seed both locales
    // so neither language tab starts empty after migration.
    return { ar: value, en: value };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      ...(typeof obj.ar === "string" ? { ar: obj.ar } : {}),
      ...(typeof obj.en === "string" ? { en: obj.en } : {}),
    };
  }
  return {};
}

export function normalizeSeoSettings(raw: unknown): SeoSettings {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  return {
    meta_title: asBilingual(source.meta_title),
    meta_author: asBilingual(source.meta_author),
    meta_description: asBilingual(source.meta_description),
    meta_image: (source.meta_image as MediaRef | undefined) ?? undefined,
  };
}

export const SOCIAL_PLATFORM_KEYS = [
  "twitter",
  "facebook",
  "instagram",
  "snapchat",
  "tiktok",
  "youtube",
  "linkedin",
] as const;

export type SocialPlatformKey = (typeof SOCIAL_PLATFORM_KEYS)[number];

export type SocialPlatformEntry = {
  url: string;
  name?: Bilingual;
  icon?: string;
};

export type SocialSettings = Partial<
  Record<SocialPlatformKey, SocialPlatformEntry>
>;

export const SOCIAL_PLATFORM_DEFAULTS: Record<
  SocialPlatformKey,
  { name: { en: string; ar: string }; icon: string }
> = {
  twitter: { name: { en: "X", ar: "إكس" }, icon: "twitter" },
  facebook: { name: { en: "Facebook", ar: "فيسبوك" }, icon: "facebook" },
  instagram: { name: { en: "Instagram", ar: "إنستغرام" }, icon: "instagram" },
  snapchat: { name: { en: "Snapchat", ar: "سناب شات" }, icon: "snapchat" },
  tiktok: { name: { en: "TikTok", ar: "تيك توك" }, icon: "tiktok" },
  youtube: { name: { en: "YouTube", ar: "يوتيوب" }, icon: "youtube" },
  linkedin: { name: { en: "LinkedIn", ar: "لينكدإن" }, icon: "linkedin" },
};

export function normalizeSocialSettings(
  raw: unknown,
): Record<SocialPlatformKey, SocialPlatformEntry> {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const out = {} as Record<SocialPlatformKey, SocialPlatformEntry>;
  for (const key of SOCIAL_PLATFORM_KEYS) {
    const defaults = SOCIAL_PLATFORM_DEFAULTS[key];
    const value = source[key];
    if (typeof value === "string") {
      out[key] = {
        url: value,
        name: { ...defaults.name },
        icon: defaults.icon,
      };
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const entry = value as Record<string, unknown>;
      const nameObj =
        entry.name && typeof entry.name === "object" && !Array.isArray(entry.name)
          ? (entry.name as Record<string, unknown>)
          : {};
      out[key] = {
        url: typeof entry.url === "string" ? entry.url : "",
        name: {
          en:
            typeof nameObj.en === "string" ? nameObj.en : defaults.name.en,
          ar:
            typeof nameObj.ar === "string" ? nameObj.ar : defaults.name.ar,
        },
        icon:
          typeof entry.icon === "string" && entry.icon
            ? entry.icon
            : defaults.icon,
      };
      continue;
    }
    out[key] = {
      url: "",
      name: { ...defaults.name },
      icon: defaults.icon,
    };
  }
  return out;
}

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
      title: "جاهز لبناء مختبرك المثالي؟ لنتحدث.",
      content:
        "فريقنا جاهز لمساعدتك في تصميم وتجهيز وتسليم بيئات مختبرية عالمية المستوى.",
      contact_label: "اتصل بنا",
      whatsapp_label: "واتساب",
    },
    en: {
      title: "Ready to build your ideal laboratory? Let's talk.",
      content:
        "Our team is ready to help you design, equip, and deliver world-class laboratory environments.",
      contact_label: "Contact Us",
      whatsapp_label: "WhatsApp",
    },
  },
  seo: {
    meta_title: {
      ar: "غولدن كواليتي | حلول المختبرات",
      en: "Golden Quality | Laboratory Solutions",
    },
    meta_author: { ar: "غولدن كواليتي", en: "Golden Quality" },
    meta_description: {
      ar: "حلول هندسية متكاملة لتجهيز المختبرات في المملكة العربية السعودية.",
      en: "Integrated engineering solutions for laboratory fit-out in Saudi Arabia.",
    },
    meta_image: null,
  },
  social: normalizeSocialSettings({
    facebook: { url: "https://facebook.com/", name: { en: "Facebook", ar: "فيسبوك" }, icon: "facebook" },
    linkedin: { url: "https://linkedin.com/", name: { en: "LinkedIn", ar: "لينكدإن" }, icon: "linkedin" },
    twitter: { url: "", name: { en: "X", ar: "إكس" }, icon: "twitter" },
    instagram: { url: "", name: { en: "Instagram", ar: "إنستغرام" }, icon: "instagram" },
  }),
};

function maybeNormalizeGroupValue(
  group: ApiSettingGroup,
  value: unknown,
): unknown {
  if (group === "social") return normalizeSocialSettings(value);
  if (group === "seo") return normalizeSeoSettings(value);
  return value;
}

export async function getSettingsGroup<T = Record<string, unknown>>(
  group: ApiSettingGroup,
): Promise<SettingsResponse<T>> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    return {
      key: group,
      value: maybeNormalizeGroupValue(
        group,
        structuredClone(mockStore[group] ?? {}),
      ) as T,
      updatedAt: new Date().toISOString(),
    };
  }

  const res = await apiFetch<SettingsResponse<T>>(`/admin/settings/${group}`, {
    method: "GET",
  });
  return {
    ...res,
    value: maybeNormalizeGroupValue(group, res.value) as T,
  };
}

export async function patchSettingsGroup<T = Record<string, unknown>>(
  group: ApiSettingGroup,
  patch: Record<string, unknown>,
): Promise<SettingsResponse<T>> {
  const body =
    group === "social"
      ? (normalizeSocialSettings(patch) as Record<string, unknown>)
      : group === "seo"
        ? (normalizeSeoSettings(patch) as Record<string, unknown>)
        : patch;

  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 250));
    mockStore[group] =
      group === "social" || group === "seo"
        ? (body as Record<string, unknown>)
        : { ...(mockStore[group] ?? {}), ...body };
    return {
      key: group,
      value: maybeNormalizeGroupValue(
        group,
        structuredClone(mockStore[group]),
      ) as T,
      updatedAt: new Date().toISOString(),
    };
  }

  const res = await apiFetch<SettingsResponse<T>>(`/admin/settings/${group}`, {
    method: "PATCH",
    body,
  });
  return {
    ...res,
    value: maybeNormalizeGroupValue(group, res.value) as T,
  };
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
