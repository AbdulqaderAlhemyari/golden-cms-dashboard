import { getToken, clearToken } from "@/lib/auth/token";
import { ApiError, type ApiErrorBody } from "@/lib/errors/mapApiError";
import { useApiMock } from "@/lib/api/mock";

export type MediaItem = {
  id: string;
  url: string;
  altEn?: string | null;
  altAr?: string | null;
  originalFilename?: string | null;
};

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new ApiError("CONFIG_ERROR", "NEXT_PUBLIC_API_URL is not set", 0);
  }
  return base.replace(/\/$/, "");
}

async function parseError(response: Response): Promise<never> {
  const text = await response.text();
  let data: ApiErrorBody | null = null;
  try {
    data = text ? (JSON.parse(text) as ApiErrorBody) : null;
  } catch {
    data = null;
  }
  const code = data?.error?.code ?? `HTTP_${response.status}`;
  const message = data?.error?.message ?? response.statusText;
  if (response.status === 401) clearToken();
  throw new ApiError(code, message, response.status, data?.error?.details);
}

export async function uploadMedia(file: File, folder = "projects"): Promise<MediaItem> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 400));
    const url = URL.createObjectURL(file);
    return {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url,
      originalFilename: file.name,
      altEn: null,
      altAr: null,
    };
  }

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getBaseUrl()}/admin/media`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!response.ok) await parseError(response);
  return (await response.json()) as MediaItem;
}

export async function updateMediaAlt(
  id: string,
  alts: { altEn?: string | null; altAr?: string | null },
): Promise<MediaItem> {
  if (useApiMock()) {
    return {
      id,
      url: "",
      altEn: alts.altEn ?? null,
      altAr: alts.altAr ?? null,
    };
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getBaseUrl()}/admin/media/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(alts),
  });

  if (!response.ok) await parseError(response);
  return (await response.json()) as MediaItem;
}
