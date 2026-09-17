import { getToken } from "@/lib/auth/token";
import { redirectToLoginExpired } from "@/lib/auth/session";
import { ApiError, type ApiErrorBody } from "@/lib/errors/mapApiError";
import { useApiMock } from "@/lib/api/mock";

export type MediaItem = {
  id: string;
  url: string;
  altEn?: string | null;
  altAr?: string | null;
  filename?: string | null;
  originalFilename?: string | null;
  folder?: string | null;
  mime?: string | null;
  createdAt?: string;
};

export type MediaListResponse = {
  items: MediaItem[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

let mockMedia: MediaItem[] = [
  {
    id: "media-demo-1",
    url: "https://picsum.photos/seed/gq1/400/300",
    filename: "lab-equipment.jpg",
    originalFilename: "lab-equipment.jpg",
    altAr: "مختبر",
    altEn: "Lab",
    folder: "projects",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-demo-2",
    url: "https://picsum.photos/seed/gq2/400/300",
    filename: "team.jpg",
    originalFilename: "team.jpg",
    altAr: null,
    altEn: null,
    folder: "about",
    createdAt: new Date().toISOString(),
  },
];

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
  if (response.status === 401) redirectToLoginExpired();
  throw new ApiError(code, message, response.status, data?.error?.details);
}

function unwrapMedia(data: unknown): MediaItem {
  if (data && typeof data === "object" && "media" in data) {
    return (data as { media: MediaItem }).media;
  }
  return data as MediaItem;
}

function displayName(item: MediaItem): string {
  return item.originalFilename || item.filename || item.id;
}

export { displayName as mediaDisplayName };

export async function listMedia(params: {
  page?: number;
  perPage?: number;
  folder?: string;
  q?: string;
} = {}): Promise<MediaListResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;

  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    let items = [...mockMedia];
    if (params.folder?.trim()) {
      const folder = params.folder.trim();
      items = items.filter((m) => (m.folder ?? "").startsWith(folder));
    }
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      items = items.filter((m) => {
        const name = displayName(m).toLowerCase();
        return (
          name.includes(q) ||
          (m.altAr ?? "").toLowerCase().includes(q) ||
          (m.altEn ?? "").toLowerCase().includes(q)
        );
      });
    }
    const total = items.length;
    const start = (page - 1) * perPage;
    return {
      items: items.slice(start, start + perPage),
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage) || 1,
    };
  }

  const search = new URLSearchParams();
  search.set("page", String(page));
  search.set("perPage", String(perPage));
  if (params.folder?.trim()) search.set("folder", params.folder.trim());

  const data = await apiJson<MediaListResponse>(
    `/admin/media?${search.toString()}`,
    { method: "GET" },
  );

  // Client-side filename/alt filter when API has no `q`
  if (params.q?.trim()) {
    const q = params.q.trim().toLowerCase();
    const filtered = data.items.filter((m) => {
      const name = displayName(m).toLowerCase();
      return (
        name.includes(q) ||
        (m.altAr ?? "").toLowerCase().includes(q) ||
        (m.altEn ?? "").toLowerCase().includes(q)
      );
    });
    return { ...data, items: filtered, total: filtered.length };
  }

  return data;
}

async function apiJson<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });

  if (response.status === 204) return undefined as T;
  if (!response.ok) await parseError(response);
  return (await response.json()) as T;
}

export async function uploadMedia(
  file: File,
  folder = "library",
): Promise<MediaItem> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 400));
    const item: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(file),
      filename: file.name,
      originalFilename: file.name,
      folder,
      altEn: null,
      altAr: null,
      mime: file.type,
      createdAt: new Date().toISOString(),
    };
    mockMedia = [item, ...mockMedia];
    return item;
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
  return unwrapMedia(await response.json());
}

export async function updateMediaAlt(
  id: string,
  alts: { altEn?: string | null; altAr?: string | null },
): Promise<MediaItem> {
  if (useApiMock()) {
    mockMedia = mockMedia.map((m) =>
      m.id === id
        ? {
            ...m,
            altEn: alts.altEn !== undefined ? alts.altEn : m.altEn,
            altAr: alts.altAr !== undefined ? alts.altAr : m.altAr,
          }
        : m,
    );
    const item = mockMedia.find((m) => m.id === id);
    if (!item) throw new ApiError("NOT_FOUND", "Media not found", 404);
    return item;
  }

  const data = await apiJson<{ media: MediaItem }>(`/admin/media/${id}`, {
    method: "PATCH",
    json: alts,
  });
  return unwrapMedia(data);
}

export async function deleteMedia(id: string): Promise<void> {
  if (useApiMock()) {
    mockMedia = mockMedia.filter((m) => m.id !== id);
    return;
  }

  await apiJson<void>(`/admin/media/${id}`, { method: "DELETE" });
}
