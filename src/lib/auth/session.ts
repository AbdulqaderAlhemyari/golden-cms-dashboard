import { clearToken } from "@/lib/auth/token";

let redirecting = false;

/**
 * Clear session and send the user to login with a friendly message.
 * Safe to call multiple times (only one redirect).
 */
export function redirectToLoginExpired(): void {
  clearToken();

  if (typeof window === "undefined") return;
  if (redirecting) return;

  const path = window.location.pathname;
  if (path.startsWith("/login")) return;

  redirecting = true;
  window.location.assign("/login?reason=expired");
}
