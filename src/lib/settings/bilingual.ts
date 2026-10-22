import type { ContentLocale } from "@/lib/pages/types";
import type { Bilingual } from "@/lib/api/settings";

export function getBilingual(
  value: Bilingual | string | undefined,
  locale: ContentLocale,
): string {
  // Legacy payloads sometimes stored a single shared string.
  if (typeof value === "string") return value;
  return value?.[locale] ?? "";
}

export function setBilingual(
  value: Bilingual | string | undefined,
  locale: ContentLocale,
  next: string,
): Bilingual {
  const base: Bilingual =
    typeof value === "string"
      ? { ar: value, en: value }
      : { ...(value ?? {}) };
  return { ...base, [locale]: next };
}
