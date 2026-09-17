"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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

type RegisterPayload = {
  locale: ContentLocale;
  setLocale: (locale: ContentLocale) => void;
  dirty: boolean;
  saving: boolean;
  save: () => void;
};

type RegisterContextValue = {
  register: (state: RegisterPayload | null) => void;
};

const RegisterContext = createContext<RegisterContextValue | null>(null);
const ChromeContext = createContext<EditorChromeState | null>(null);

/**
 * Outer shell keeps `children` referentially stable so chrome state updates
 * inside the inner provider do not re-render the whole dashboard tree.
 */
export function EditorChromeProvider({ children }: { children: ReactNode }) {
  return <EditorChromeProviderInner>{children}</EditorChromeProviderInner>;
}

function EditorChromeProviderInner({ children }: { children: ReactNode }) {
  const [chrome, setChrome] = useState<EditorChromeState | null>(null);

  // Callbacks live in a ref so register() only commits React state when
  // locale / dirty / saving change — not when save/setLocale identities churn.
  const callbacksRef = useRef<{
    setLocale: (locale: ContentLocale) => void;
    save: () => void;
  }>({
    setLocale: () => undefined,
    save: () => undefined,
  });

  const stableSetLocale = useCallback((locale: ContentLocale) => {
    callbacksRef.current.setLocale(locale);
  }, []);

  const stableSave = useCallback(() => {
    callbacksRef.current.save();
  }, []);

  const register = useCallback(
    (state: RegisterPayload | null) => {
      if (state === null) {
        setChrome((prev) => (prev === null ? prev : null));
        return;
      }

      callbacksRef.current = {
        setLocale: state.setLocale,
        save: state.save,
      };

      setChrome((prev) => {
        if (
          prev &&
          prev.locale === state.locale &&
          prev.dirty === state.dirty &&
          prev.saving === state.saving
        ) {
          return prev;
        }
        return {
          active: true,
          locale: state.locale,
          dirty: state.dirty,
          saving: state.saving,
          setLocale: stableSetLocale,
          save: stableSave,
        };
      });
    },
    [stableSave, stableSetLocale],
  );

  const registerValue = useMemo(() => ({ register }), [register]);

  return (
    <RegisterContext.Provider value={registerValue}>
      <ChromeContext.Provider value={chrome}>{children}</ChromeContext.Provider>
    </RegisterContext.Provider>
  );
}

export function useEditorChrome(): RegisterContextValue {
  const ctx = useContext(RegisterContext);
  if (!ctx) {
    throw new Error("useEditorChrome must be used within EditorChromeProvider");
  }
  return ctx;
}

export function useOptionalEditorChrome(): EditorChromeState | null {
  return useContext(ChromeContext);
}
