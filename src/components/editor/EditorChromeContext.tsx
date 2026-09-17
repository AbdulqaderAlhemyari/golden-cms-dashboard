"use client";

import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
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

type ChromeStore = {
  chrome: EditorChromeState | null;
  callbacks: {
    setLocale: (locale: ContentLocale) => void;
    save: () => void;
  };
  listeners: Set<() => void>;
};

function createChromeStore(): ChromeStore {
  return {
    chrome: null,
    callbacks: {
      setLocale: () => undefined,
      save: () => undefined,
    },
    listeners: new Set(),
  };
}

function subscribeStore(store: ChromeStore, onStoreChange: () => void) {
  store.listeners.add(onStoreChange);
  return () => {
    store.listeners.delete(onStoreChange);
  };
}

function getStoreSnapshot(store: ChromeStore) {
  return store.chrome;
}

function emit(store: ChromeStore) {
  store.listeners.forEach((listener) => listener());
}

function registerInStore(store: ChromeStore, state: RegisterPayload | null) {
  if (state === null) {
    if (store.chrome === null) return;
    store.chrome = null;
    emit(store);
    return;
  }

  store.callbacks = {
    setLocale: state.setLocale,
    save: state.save,
  };

  const prev = store.chrome;
  if (
    prev &&
    prev.locale === state.locale &&
    prev.dirty === state.dirty &&
    prev.saving === state.saving
  ) {
    return;
  }

  store.chrome = {
    active: true,
    locale: state.locale,
    dirty: state.dirty,
    saving: state.saving,
    setLocale: (locale) => store.callbacks.setLocale(locale),
    save: () => store.callbacks.save(),
  };
  emit(store);
}

const RegisterContext = createContext<RegisterContextValue | null>(null);
const StoreContext = createContext<ChromeStore | null>(null);

export function EditorChromeProvider({ children }: { children: ReactNode }) {
  // One store per provider mount; register identity never changes.
  const storeRef = useRef<ChromeStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createChromeStore();
  }
  const store = storeRef.current;

  const registerRef = useRef<(state: RegisterPayload | null) => void>(
    (state) => registerInStore(store, state),
  );

  const registerValueRef = useRef<RegisterContextValue>({
    register: registerRef.current,
  });

  return (
    <StoreContext.Provider value={store}>
      <RegisterContext.Provider value={registerValueRef.current}>
        {children}
      </RegisterContext.Provider>
    </StoreContext.Provider>
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
  const store = useContext(StoreContext);
  return useSyncExternalStore(
    (onStoreChange) =>
      store ? subscribeStore(store, onStoreChange) : () => undefined,
    () => (store ? getStoreSnapshot(store) : null),
    () => null,
  );
}
