import type { ContentLocale } from "@/lib/pages/types";
import type { Bilingual } from "@/lib/api/settings";

export function getBilingual(
  value: Bilingual | undefined,
  locale: ContentLocale,
): string {
  return value?.[locale] ?? "";
}

export function setBilingual(
  value: Bilingual | undefined,
  locale: ContentLocale,
  next: string,
): Bilingual {
  return { ...(value ?? {}), [locale]: next };
}
