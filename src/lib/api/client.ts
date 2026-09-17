import { clearToken, getToken } from "@/lib/auth/token";
import { ApiError, type ApiErrorBody } from "@/lib/errors/mapApiError";

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new ApiError(
      "CONFIG_ERROR",
      "NEXT_PUBLIC_API_URL is not set",
      0,
    );
  }
  return base.replace(/\/$/, "");
}

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip Authorization header (e.g. login). */
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Network request failed", 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errBody = data as ApiErrorBody | null;
    const code = errBody?.error?.code ?? `HTTP_${response.status}`;
    const message = errBody?.error?.message ?? response.statusText;

    if (response.status === 401 && auth) {
      clearToken();
    }

    throw new ApiError(code, message, response.status, errBody?.error?.details);
  }

  return data as T;
}
