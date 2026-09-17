import { TOKEN_KEY } from "@/lib/auth/constants";

export { TOKEN_KEY };

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function canUseDom(): boolean {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!canUseDom()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!canUseDom()) return;
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}`;
}

export function clearToken(): void {
  if (!canUseDom()) return;
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; SameSite=Lax; Max-Age=0`;
}

export function hasToken(): boolean {
  return Boolean(getToken());
}
