"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import {
  getMenu,
  putMenu,
  type MenuItem,
  type MenuLocation,
} from "@/lib/api/menus";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

export type MenuDraft = {
  main: { ar: MenuItem[]; en: MenuItem[] };
  footer: { ar: MenuItem[]; en: MenuItem[] };
};

function emptyDraft(): MenuDraft {
  return {
    main: { ar: [], en: [] },
    footer: { ar: [], en: [] },
  };
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

export function useMenuEditor() {
  const queryClient = useQueryClient();
  const { register } = useEditorChrome();
  const [locale, setLocaleState] = useState<ContentLocale>("ar");
  const [draft, setDraft] = useState<MenuDraft>(emptyDraft);
  const baselineRef = useRef("");
  const [ready, setReady] = useState(false);

  const query = useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const [main, footer] = await Promise.all([
        getMenu("main"),
        getMenu("footer"),
      ]);
      return { main: main.items, footer: footer.items } satisfies MenuDraft;
    },
  });

  useEffect(() => {
    if (!query.data) return;
    const next = structuredClone(query.data);
    setDraft(next);
    baselineRef.current = stableStringify(next);
    setReady(true);
  }, [query.data]);

  const dirty = useMemo(() => {
    if (!ready) return false;
    return stableStringify(draft) !== baselineRef.current;
  }, [draft, ready]);

  const { dialog: unsavedDialog } = useUnsavedChanges(dirty);

  const mutation = useMutation({
    mutationFn: async () => {
      const [main, footer] = await Promise.all([
        putMenu("main", draft.main),
        putMenu("footer", draft.footer),
      ]);
      return {
        main: main.items,
        footer: footer.items,
      } satisfies MenuDraft;
    },
    onSuccess: (saved) => {
      const next = structuredClone(saved);
      setDraft(next);
      baselineRef.current = stableStringify(next);
      void queryClient.setQueryData(["menus"], next);
      toast.success(copy.saved);
    },
    onError: (error) => toast.error(mapApiError(error)),
  });

  const save = useCallback(() => {
    if (mutation.isPending) return;
    mutation.mutate();
  }, [mutation]);

  const setLocale = useCallback(
    (next: ContentLocale) => {
      if (next === locale) return;
      if (dirty) {
        const leave = window.confirm(copy.unsavedChanges);
        if (!leave) return;
      }
      setLocaleState(next);
    },
    [dirty, locale],
  );

  useEffect(() => {
    register({
      locale,
      setLocale,
      dirty,
      saving: mutation.isPending,
      save,
    });
    return () => register(null);
  }, [register, locale, setLocale, dirty, mutation.isPending, save]);

  const updateLabel = useCallback(
    (location: MenuLocation, index: number, label: string) => {
      setDraft((prev) => {
        const items = [...prev[location][locale]];
        const current = items[index];
        if (!current) return prev;
        items[index] = { ...current, label };
        return {
          ...prev,
          [location]: {
            ...prev[location],
            [locale]: items,
          },
        };
      });
    },
    [locale],
  );

  const reorder = useCallback(
    (location: MenuLocation, from: number, to: number) => {
      if (from === to) return;
      setDraft((prev) => {
        const move = <T,>(list: T[]) => {
          const next = [...list];
          const [item] = next.splice(from, 1);
          if (item === undefined) return list;
          next.splice(to, 0, item);
          return next;
        };
        return {
          ...prev,
          [location]: {
            ar: move(prev[location].ar),
            en: move(prev[location].en),
          },
        };
      });
    },
    [],
  );

  return {
    locale,
    draft,
    updateLabel,
    reorder,
    dirty,
    save,
    saving: mutation.isPending,
    loading: query.isLoading || !ready,
    error: query.error,
    reload: () => void query.refetch(),
    unsavedDialog,
  };
}
