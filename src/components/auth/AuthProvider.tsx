"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getMe, logout as apiLogout, type AuthUser } from "@/lib/api/auth";
import { clearToken, getToken } from "@/lib/auth/token";
import { copy } from "@/lib/copy/ar";
import { ApiError } from "@/lib/errors/mapApiError";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const token = getToken();
      if (!token) {
        clearToken();
        router.replace("/login");
        return;
      }

      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          setLoading(false);
        }
      } catch (error) {
        clearToken();
        if (!cancelled) {
          const reason =
            error instanceof ApiError && error.status === 401
              ? "expired"
              : "error";
          router.replace(
            reason === "expired" ? "/login?reason=expired" : "/login",
          );
        }
      }
    }

    void validate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const signOut = useCallback(() => {
    apiLogout();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, signOut }),
    [user, loading, signOut],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        {copy.loading}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
