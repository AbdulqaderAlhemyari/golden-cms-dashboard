"use client";

import { useOptionalContentLocale } from "@/components/shell/ContentLocaleContext";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import { copy } from "@/lib/copy/ar";
import { hasLocaleScriptMismatch } from "@/lib/localeScript";

type LocaleScriptHintProps = {
  value: unknown;
  /** Set false for slugs, URLs, media English titles, etc. */
  enabled?: boolean;
  /** Override active language tab (e.g. side-by-side AR/EN alt fields). */
  locale?: ContentLocale | null;
};

export function LocaleScriptHint({
  value,
  enabled = true,
  locale: localeOverride,
}: LocaleScriptHintProps) {
  const contextLocale = useOptionalContentLocale();
  const locale =
    localeOverride !== undefined ? localeOverride : contextLocale;

  if (!enabled || !locale) return null;
  if (!hasLocaleScriptMismatch(locale, value)) return null;

  return (
    <p className="text-xs leading-relaxed text-amber-700" role="status">
      {locale === "ar"
        ? copy.scriptHintEnglishInArabic
        : copy.scriptHintArabicInEnglish}
    </p>
  );
}
