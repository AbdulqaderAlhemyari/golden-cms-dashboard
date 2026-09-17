"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import type { ContentLocale } from "@/components/shell/LanguageTabs";
import {
  getSettingsGroup,
  patchSettingsGroup,
  type ApiSettingGroup,
} from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

export function useSettingsEditor<T extends object>(
  group: ApiSettingGroup,
) {
  const queryClient = useQueryClient();
  const { register } = useEditorChrome();
  const [locale, setLocaleState] = useState<ContentLocale>("ar");
  const [draft, setDraft] = useState<T>({} as T);
  const baselineRef = useRef("");
  const [ready, setReady] = useState(false);

  const query = useQuery({
    queryKey: ["settings", group],
    queryFn: () => getSettingsGroup<T>(group),
  });

  useEffect(() => {
    if (!query.data) return;
    const next = structuredClone(query.data.value ?? ({} as T));
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
    mutationFn: () =>
      patchSettingsGroup<T>(group, draft as Record<string, unknown>),
    onSuccess: (data) => {
      const next = structuredClone(data.value ?? draft);
      setDraft(next);
      baselineRef.current = stableStringify(next);
      void queryClient.setQueryData(["settings", group], data);
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

  return {
    locale,
    setLocale,
    draft,
    setDraft,
    dirty,
    save,
    saving: mutation.isPending,
    loading: query.isLoading || !ready,
    error: query.error,
    reload: () => void query.refetch(),
    unsavedDialog,
  };
}
