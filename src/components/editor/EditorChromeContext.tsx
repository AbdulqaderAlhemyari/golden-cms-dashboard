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

export type EditorChromeState = {
  active: boolean;
  locale: ContentLocale;
  setLocale: (locale: ContentLocale) => void;
  dirty: boolean;
  saving: boolean;
  save: () => void;
};

type EditorChromeContextValue = {
  chrome: EditorChromeState | null;
  register: (state: Omit<EditorChromeState, "active"> | null) => void;
};

const EditorChromeContext = createContext<EditorChromeContextValue | null>(
  null,
);

export function EditorChromeProvider({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<EditorChromeState | null>(null);

  const register = useCallback(
    (state: Omit<EditorChromeState, "active"> | null) => {
      setChrome(state ? { ...state, active: true } : null);
    },
    [],
  );

  const value = useMemo(() => ({ chrome, register }), [chrome, register]);

  return (
    <EditorChromeContext.Provider value={value}>
      {children}
    </EditorChromeContext.Provider>
  );
}

export function useEditorChrome(): EditorChromeContextValue {
  const ctx = useContext(EditorChromeContext);
  if (!ctx) {
    throw new Error("useEditorChrome must be used within EditorChromeProvider");
  }
  return ctx;
}

export function useOptionalEditorChrome(): EditorChromeState | null {
  return useContext(EditorChromeContext)?.chrome ?? null;
}
