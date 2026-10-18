import { getToken } from "@/lib/auth/token";
import { redirectToLoginExpired } from "@/lib/auth/session";
import { ApiError, type ApiErrorBody } from "@/lib/errors/mapApiError";
import { useApiMock } from "@/lib/api/mock";

export type MediaItem = {
  id: string;
  url: string;
  title?: string | null;
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

export type FolderTreeNode = {
  path: string;
  name: string;
  children: FolderTreeNode[];
};

export type MediaFoldersResponse = {
  folders: string[];
  tree: FolderTreeNode[];
};

export type UploadMediaOptions = {
  folder?: string;
  title?: string;
  altAr?: string;
  altEn?: string;
};

let mockMedia: MediaItem[] = [
  {
    id: "media-demo-1",
    url: "https://picsum.photos/seed/gq1/400/300",
    filename: "lab-equipment.jpg",
    title: "معدات مختبر",
    altAr: "مختبر",
    altEn: "Lab",
    folder: "projects/demo/gallery",
    createdAt: new Date().toISOString(),
  },
  {
    id: "media-demo-2",
    url: "https://picsum.photos/seed/gq2/400/300",
    filename: "team.jpg",
    title: "فريق العمل",
    altAr: null,
    altEn: null,
    folder: "branding",
    createdAt: new Date().toISOString(),
  },
];

let mockFolders = [
  "branding",
  "library",
  "misc",
  "pages/about",
  "pages/contact",
  "pages/home",
  "pages/services",
  "projects",
  "projects/demo/gallery",
  "services",
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

export function mediaDisplayName(item: MediaItem): string {
  return (
    item.title?.trim() ||
    item.originalFilename ||
    item.filename ||
    item.id
  );
}

function buildMockTree(folders: string[]): FolderTreeNode[] {
  type Mutable = { path: string; name: string; children: Map<string, Mutable> };
  const root = new Map<string, Mutable>();
  for (const folder of folders) {
    const parts = folder.split("/").filter(Boolean);
    let level = root;
    let acc = "";
    for (const part of parts) {
      acc = acc ? `${acc}/${part}` : part;
      let node = level.get(part);
      if (!node) {
        node = { path: acc, name: part, children: new Map() };
        level.set(part, node);
      }
      level = node.children;
    }
  }
  function toArray(map: Map<string, Mutable>): FolderTreeNode[] {
    return [...map.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((n) => ({
        path: n.path,
        name: n.name,
        children: toArray(n.children),
      }));
  }
  return toArray(root);
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

export async function listMediaFolders(): Promise<MediaFoldersResponse> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 100));
    const folders = [...mockFolders].sort();
    return { folders, tree: buildMockTree(folders) };
  }
  return apiJson<MediaFoldersResponse>("/admin/media/folders", {
    method: "GET",
  });
}

export async function createMediaFolder(input: {
  name: string;
  parent?: string;
}): Promise<{ folder: string }> {
  if (useApiMock()) {
    const parent = input.parent?.trim() ?? "";
    const name = input.name.trim().toLowerCase().replace(/\s+/g, "-");
    const folder = parent ? `${parent}/${name}` : name;
    if (!mockFolders.includes(folder)) mockFolders = [...mockFolders, folder];
    return { folder };
  }
  return apiJson<{ folder: string }>("/admin/media/folders", {
    method: "POST",
    json: input,
  });
}

export async function listMedia(params: {
  page?: number;
  perPage?: number;
  folder?: string;
  exact?: boolean;
  q?: string;
} = {}): Promise<MediaListResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 24;
  const exact = params.exact ?? true;

  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    let items = [...mockMedia];
    if (params.folder?.trim()) {
      const folder = params.folder.trim();
      items = items.filter((m) =>
        exact
          ? (m.folder ?? "") === folder
          : (m.folder ?? "").startsWith(folder),
      );
    }
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      items = items.filter((m) => {
        const name = mediaDisplayName(m).toLowerCase();
        return (
          name.includes(q) ||
          (m.altAr ?? "").toLowerCase().includes(q) ||
          (m.altEn ?? "").toLowerCase().includes(q) ||
          (m.filename ?? "").toLowerCase().includes(q)
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
  search.set("exact", exact ? "true" : "false");
  if (params.folder?.trim()) search.set("folder", params.folder.trim());
  if (params.q?.trim()) search.set("q", params.q.trim());

  return apiJson<MediaListResponse>(
    `/admin/media?${search.toString()}`,
    { method: "GET" },
  );
}

export async function uploadMedia(
  file: File,
  folderOrOptions: string | UploadMediaOptions = "library",
): Promise<MediaItem> {
  const options: UploadMediaOptions =
    typeof folderOrOptions === "string"
      ? { folder: folderOrOptions }
      : folderOrOptions;
  const folder = options.folder?.trim() || "library";

  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 400));
    const item: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(file),
      filename: file.name,
      title: options.title?.trim() || file.name,
      folder,
      altEn: options.altEn ?? null,
      altAr: options.altAr ?? null,
      mime: file.type,
      createdAt: new Date().toISOString(),
    };
    mockMedia = [item, ...mockMedia];
    if (!mockFolders.includes(folder)) mockFolders = [...mockFolders, folder];
    return item;
  }

  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  if (options.title?.trim()) form.append("title", options.title.trim());
  if (options.altAr?.trim()) form.append("altAr", options.altAr.trim());
  if (options.altEn?.trim()) form.append("altEn", options.altEn.trim());

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

export async function updateMedia(
  id: string,
  patch: {
    title?: string | null;
    altEn?: string | null;
    altAr?: string | null;
  },
): Promise<MediaItem> {
  if (useApiMock()) {
    mockMedia = mockMedia.map((m) =>
      m.id === id
        ? {
            ...m,
            title: patch.title !== undefined ? patch.title : m.title,
            altEn: patch.altEn !== undefined ? patch.altEn : m.altEn,
            altAr: patch.altAr !== undefined ? patch.altAr : m.altAr,
          }
        : m,
    );
    const item = mockMedia.find((m) => m.id === id);
    if (!item) throw new ApiError("NOT_FOUND", "Media not found", 404);
    return item;
  }

  const data = await apiJson<{ media: MediaItem }>(`/admin/media/${id}`, {
    method: "PATCH",
    json: patch,
  });
  return unwrapMedia(data);
}

/** @deprecated Use updateMedia */
export async function updateMediaAlt(
  id: string,
  alts: { altEn?: string | null; altAr?: string | null },
): Promise<MediaItem> {
  return updateMedia(id, alts);
}

export async function deleteMedia(id: string): Promise<void> {
  if (useApiMock()) {
    mockMedia = mockMedia.filter((m) => m.id !== id);
    return;
  }

  await apiJson<void>(`/admin/media/${id}`, { method: "DELETE" });
}
