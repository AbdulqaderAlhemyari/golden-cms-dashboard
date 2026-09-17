import { apiFetch } from "@/lib/api/client";
import { clearToken, setToken } from "@/lib/auth/token";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  expiresIn: string;
  user: AuthUser;
};

const useAuthMock = () => process.env.NEXT_PUBLIC_USE_AUTH_MOCK === "true";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  if (useAuthMock()) {
    const data: LoginResponse = {
      token: "mock-gq-cms-token",
      expiresIn: "7d",
      user: { id: "mock-admin", email, role: "admin" },
    };
    setToken(data.token);
    return data;
  }

  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  setToken(data.token);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  if (useAuthMock()) {
    return {
      id: "mock-admin",
      email: "admin@example.com",
      role: "admin",
    };
  }

  const data = await apiFetch<AuthUser | { user: AuthUser }>("/auth/me", {
    method: "GET",
  });

  if (data && typeof data === "object" && "user" in data && data.user) {
    return data.user;
  }

  return data as AuthUser;
}

export function logout(): void {
  clearToken();
}
