import type { ContentLocale } from "@/components/shell/LanguageTabs";

const ARABIC_LETTER = /[\u0600-\u06FF]/;
const LATIN_LETTER = /[A-Za-z]/;

/** Strip HTML so rich-text values can be checked. */
export function plainTextForScriptCheck(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(new RegExp(pattern, "g")) ?? []).length;
}

/**
 * Returns true when the typed script likely does not match the active language tab.
 * Requires a few letters to avoid noise from single characters / codes.
 */
export function hasLocaleScriptMismatch(
  locale: ContentLocale | null | undefined,
  value: unknown,
): boolean {
  if (!locale) return false;
  const text = plainTextForScriptCheck(value);
  if (text.length < 2) return false;

  const arabicCount = countMatches(text, ARABIC_LETTER);
  const latinCount = countMatches(text, LATIN_LETTER);

  if (locale === "ar") {
    return latinCount >= 3 && latinCount > arabicCount;
  }

  return arabicCount >= 2 && arabicCount >= latinCount;
}
