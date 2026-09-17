"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import { getPage, patchPage } from "@/lib/api/pages";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import type { ApiPageKey, PageSections } from "@/lib/pages/types";

function cloneSections(sections: PageSections): PageSections {
  return structuredClone(sections);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

export function usePageEditor(pageKey: ApiPageKey) {
  const queryClient = useQueryClient();
  const { register } = useEditorChrome();
  const [locale, setLocaleState] = useState<ContentLocale>("ar");
  const [draft, setDraft] = useState<PageSections>({});
  const baselineRef = useRef("");
  const [baselineReady, setBaselineReady] = useState(false);

  const query = useQuery({
    queryKey: ["page", pageKey, locale],
    queryFn: () => getPage(pageKey, locale),
  });

  useEffect(() => {
    if (!query.data) return;
    const raw = query.data.sections ?? {};
    const next = cloneSections(
      Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [key, value ?? {}]),
      ),
    );
    setDraft(next);
    baselineRef.current = stableStringify(next);
    setBaselineReady(true);
  }, [query.data]);

  const dirty = useMemo(() => {
    if (!baselineReady) return false;
    return stableStringify(draft) !== baselineRef.current;
  }, [draft, baselineReady]);

  const { dialog: unsavedDialog } = useUnsavedChanges(dirty);

  const draftRef = useRef(draft);
  const localeRef = useRef(locale);
  draftRef.current = draft;
  localeRef.current = locale;

  const mutation = useMutation({
    mutationFn: () =>
      patchPage(pageKey, {
        locale: localeRef.current,
        sections: draftRef.current,
      }),
    onSuccess: (data) => {
      const next = cloneSections(data.sections ?? draftRef.current);
      setDraft(next);
      baselineRef.current = stableStringify(next);
      void queryClient.setQueryData(
        ["page", pageKey, localeRef.current],
        data,
      );
      toast.success(copy.saved);
    },
    onError: (error) => {
      toast.error(mapApiError(error));
    },
  });

  const saving = mutation.isPending;

  const save = useCallback(() => {
    mutation.mutate();
  }, [mutation.mutate]);

  const setLocale = useCallback(
    (next: ContentLocale) => {
      if (next === locale) return;
      if (dirty) {
        const leave = window.confirm(copy.unsavedChanges);
        if (!leave) return;
      }
      setBaselineReady(false);
      setLocaleState(next);
    },
    [dirty, locale],
  );

  const updateSection = useCallback((sectionKey: string, value: unknown) => {
    setDraft((prev) => ({
      ...prev,
      [sectionKey]: value,
    }));
  }, []);

  const saveRef = useRef(save);
  const setLocaleRef = useRef(setLocale);
  saveRef.current = save;
  setLocaleRef.current = setLocale;

  useEffect(() => {
    register({
      locale,
      dirty,
      saving,
      setLocale: (next) => setLocaleRef.current(next),
      save: () => saveRef.current(),
    });
  }, [register, locale, dirty, saving]);

  useEffect(() => {
    return () => register(null);
    // Unmount only — register is a stable store API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    locale,
    setLocale,
    draft,
    updateSection,
    dirty,
    save,
    saving,
    loading: query.isLoading || !baselineReady,
    error: query.error,
    reload: () => void query.refetch(),
    unsavedDialog,
  };
}
