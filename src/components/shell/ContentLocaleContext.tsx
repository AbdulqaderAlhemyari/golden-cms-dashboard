"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ContentLocale } from "@/components/shell/LanguageTabs";

type LocaleEntry = {
  id: string;
  locale: ContentLocale;
};

type ContentLocaleContextValue = {
  locale: ContentLocale | null;
  publish: (id: string, locale: ContentLocale) => void;
  unpublish: (id: string) => void;
};

const ContentLocaleContext = createContext<ContentLocaleContextValue | null>(
  null,
);

export function ContentLocaleProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LocaleEntry[]>([]);

  const publish = useCallback((id: string, locale: ContentLocale) => {
    setEntries((prev) => {
      const rest = prev.filter((entry) => entry.id !== id);
      return [...rest, { id, locale }];
    });
  }, []);

  const unpublish = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const locale = entries[entries.length - 1]?.locale ?? null;

  const value = useMemo(
    () => ({ locale, publish, unpublish }),
    [locale, publish, unpublish],
  );

  return (
    <ContentLocaleContext.Provider value={value}>
      {children}
    </ContentLocaleContext.Provider>
  );
}

export function useOptionalContentLocale(): ContentLocale | null {
  return useContext(ContentLocaleContext)?.locale ?? null;
}

export function useContentLocalePublisher(): {
  publish: (id: string, locale: ContentLocale) => void;
  unpublish: (id: string) => void;
} {
  const ctx = useContext(ContentLocaleContext);
  return {
    publish: ctx?.publish ?? (() => undefined),
    unpublish: ctx?.unpublish ?? (() => undefined),
  };
}
