"use client";

import { useEffect, useId } from "react";
import { useContentLocalePublisher } from "@/components/shell/ContentLocaleContext";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

export type ContentLocale = "ar" | "en";

type LanguageTabsProps = {
  value: ContentLocale;
  onChange: (locale: ContentLocale) => void;
  className?: string;
};

export function LanguageTabs({
  value,
  onChange,
  className,
}: LanguageTabsProps) {
  const tabId = useId();
  const { publish, unpublish } = useContentLocalePublisher();

  useEffect(() => {
    publish(tabId, value);
    return () => unpublish(tabId);
  }, [tabId, value, publish, unpublish]);

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-border bg-surface p-1",
        className,
      )}
      role="tablist"
      aria-label={copy.contentLanguage}
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "ar"}
        className={cn(
          "min-h-[var(--touch-min)] rounded-md px-3 text-sm font-semibold transition-colors",
          value === "ar"
            ? "bg-primary text-primary-foreground"
            : "text-muted hover:text-foreground",
        )}
        onClick={() => onChange("ar")}
      >
        {copy.localeAr}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "en"}
        className={cn(
          "min-h-[var(--touch-min)] rounded-md px-3 text-sm font-semibold transition-colors",
          value === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted hover:text-foreground",
        )}
        onClick={() => onChange("en")}
      >
        {copy.localeEn}
      </button>
    </div>
  );
}
