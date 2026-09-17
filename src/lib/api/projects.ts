import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";

export type MediaRefObject = {
  id: string;
  url?: string;
};

export type ProjectTranslation = {
  title: string;
  client?: string;
  location?: string;
  content?: string;
  services?: string[];
};

export type Project = {
  id: string;
  slug: string;
  year: number | null;
  featured: boolean;
  draft: boolean;
  publishedAt?: string | null;
  title?: string | null;
  translations?: {
    ar?: ProjectTranslation;
    en?: ProjectTranslation;
  };
  cover?: MediaRefObject | null;
  gallery?: MediaRefObject[];
  warnings?: Array<{ code: string; message: string }>;
};

export type ProjectListResponse = {
  items: Project[];
};

export type ProjectCounts = {
  visible: number;
  hidden: number;
  featured: number;
  total: number;
};

export type CreateProjectInput = {
  slug: string;
  year?: number | null;
  featured?: boolean;
  draft?: boolean;
  coverMediaId?: string | null;
  galleryMediaIds?: string[];
  translations: {
    ar: ProjectTranslation;
    en: ProjectTranslation;
  };
};

type ListProjectsParams = {
  locale?: "ar" | "en";
  draft?: "all" | "true" | "false";
  featured?: "all" | "true" | "false";
  q?: string;
};

let mockProjects: Project[] = [
  {
    id: "1",
    slug: "oil-gas-lab",
    year: 2024,
    draft: false,
    featured: true,
    title: "تجهيز مختبر النفط والغاز",
    cover: null,
    translations: {
      ar: {
        title: "تجهيز مختبر النفط والغاز",
        client: "أرامكو",
        location: "الظهران",
        content: "",
        services: [],
      },
      en: {
        title: "Oil & Gas Lab Setup",
        client: "Aramco",
        location: "Dhahran",
        content: "",
        services: [],
      },
    },
  },
  {
    id: "2",
    slug: "quality-audit",
    year: 2023,
    draft: false,
    featured: true,
    title: "تدقيق جودة المنشآت",
    cover: null,
  },
  {
    id: "3",
    slug: "calibration-center",
    year: 2023,
    draft: false,
    featured: true,
    title: "مركز المعايرة",
    cover: null,
  },
  {
    id: "4",
    slug: "training-program",
    year: 2022,
    draft: false,
    featured: false,
    title: "برنامج التدريب",
    cover: null,
  },
  {
    id: "5",
    slug: "draft-project",
    year: 2025,
    draft: true,
    featured: false,
    title: "مشروع قيد الإعداد",
    cover: null,
  },
];

function matchesQuery(project: Project, q?: string): boolean {
  if (!q?.trim()) return true;
  const needle = q.trim().toLowerCase();
  const title = (project.title ?? "").toLowerCase();
  const slug = project.slug.toLowerCase();
  const ar = project.translations?.ar?.title?.toLowerCase() ?? "";
  const en = project.translations?.en?.title?.toLowerCase() ?? "";
  return (
    title.includes(needle) ||
    slug.includes(needle) ||
    ar.includes(needle) ||
    en.includes(needle)
  );
}

export async function listProjects(
  params: ListProjectsParams = {},
): Promise<ProjectListResponse> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    let items = [...mockProjects];
    if (params.draft === "true") items = items.filter((p) => p.draft);
    if (params.draft === "false") items = items.filter((p) => !p.draft);
    if (params.featured === "true") items = items.filter((p) => p.featured);
    if (params.featured === "false") items = items.filter((p) => !p.featured);
    items = items.filter((p) => matchesQuery(p, params.q));
    return { items };
  }

  const search = new URLSearchParams();
  search.set("locale", params.locale ?? "ar");
  search.set("draft", params.draft ?? "all");
  search.set("featured", params.featured ?? "all");
  if (params.q?.trim()) search.set("q", params.q.trim());

  return apiFetch<ProjectListResponse>(`/admin/projects?${search.toString()}`, {
    method: "GET",
  });
}

export async function getProjectCounts(): Promise<ProjectCounts> {
  const { items } = await listProjects({ locale: "ar", draft: "all" });
  const visible = items.filter((p) => !p.draft).length;
  const hidden = items.filter((p) => p.draft).length;
  const featured = items.filter((p) => p.featured && !p.draft).length;

  return {
    visible,
    hidden,
    featured,
    total: items.length,
  };
}

export async function createProject(
  input: CreateProjectInput,
): Promise<{ project: Project }> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 300));
    if (mockProjects.some((p) => p.slug === input.slug)) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("SLUG_TAKEN", "Slug taken", 409);
    }
    const project: Project = {
      id: `mock-${Date.now()}`,
      slug: input.slug,
      year: input.year ?? null,
      featured: input.featured ?? false,
      draft: input.draft ?? true,
      title: input.translations.ar.title || input.translations.en.title,
      translations: input.translations,
      cover: input.coverMediaId ? { id: input.coverMediaId } : null,
      gallery: (input.galleryMediaIds ?? []).map((id) => ({ id })),
    };
    mockProjects = [project, ...mockProjects];
    return { project };
  }

  return apiFetch<{ project: Project }>("/admin/projects", {
    method: "POST",
    body: input,
  });
}

export async function publishProject(
  idOrSlug: string,
): Promise<{ project: Project }> {
  if (useApiMock()) {
    mockProjects = mockProjects.map((p) =>
      p.id === idOrSlug || p.slug === idOrSlug
        ? { ...p, draft: false, publishedAt: new Date().toISOString() }
        : p,
    );
    const project = mockProjects.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug,
    )!;
    return { project };
  }

  return apiFetch<{ project: Project }>(
    `/admin/projects/${idOrSlug}/publish`,
    { method: "POST", body: {} },
  );
}

export async function unpublishProject(
  idOrSlug: string,
): Promise<{ project: Project }> {
  if (useApiMock()) {
    mockProjects = mockProjects.map((p) =>
      p.id === idOrSlug || p.slug === idOrSlug
        ? { ...p, draft: true, publishedAt: null }
        : p,
    );
    const project = mockProjects.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug,
    )!;
    return { project };
  }

  return apiFetch<{ project: Project }>(
    `/admin/projects/${idOrSlug}/unpublish`,
    { method: "POST", body: {} },
  );
}

export async function getProject(
  idOrSlug: string,
  locale: "ar" | "en" = "ar",
): Promise<{ project: Project }> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    const project = mockProjects.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug,
    );
    if (!project) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Project not found", 404);
    }
    const title =
      locale === "en"
        ? project.translations?.en?.title ?? project.title
        : project.translations?.ar?.title ?? project.title;
    return { project: { ...project, title: title ?? project.title } };
  }

  return apiFetch<{ project: Project }>(
    `/admin/projects/${idOrSlug}?locale=${locale}`,
    { method: "GET" },
  );
}

export type UpdateProjectInput = {
  slug?: string;
  year?: number | null;
  featured?: boolean;
  draft?: boolean;
  coverMediaId?: string | null;
  translations?: {
    ar?: Partial<ProjectTranslation>;
    en?: Partial<ProjectTranslation>;
  };
};

export async function updateProject(
  idOrSlug: string,
  input: UpdateProjectInput,
): Promise<{ project: Project }> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 250));
    const index = mockProjects.findIndex(
      (p) => p.id === idOrSlug || p.slug === idOrSlug,
    );
    if (index < 0) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Project not found", 404);
    }
    const existing = mockProjects[index];
    const next: Project = {
      ...existing,
      slug: input.slug ?? existing.slug,
      year: input.year !== undefined ? input.year : existing.year,
      featured: input.featured ?? existing.featured,
      draft: input.draft ?? existing.draft,
      translations: {
        ar: {
          title: existing.translations?.ar?.title ?? existing.title ?? "",
          client: existing.translations?.ar?.client ?? "",
          location: existing.translations?.ar?.location ?? "",
          content: existing.translations?.ar?.content ?? "",
          services: existing.translations?.ar?.services ?? [],
          ...input.translations?.ar,
        },
        en: {
          title: existing.translations?.en?.title ?? "",
          client: existing.translations?.en?.client ?? "",
          location: existing.translations?.en?.location ?? "",
          content: existing.translations?.en?.content ?? "",
          services: existing.translations?.en?.services ?? [],
          ...input.translations?.en,
        },
      },
    };
    next.title = next.translations?.ar?.title || next.translations?.en?.title;
    if (input.coverMediaId !== undefined) {
      next.cover = input.coverMediaId
        ? next.gallery?.find((g) => g.id === input.coverMediaId) ?? {
            id: input.coverMediaId,
          }
        : null;
    }

    const warnings: Project["warnings"] = [];
    if (next.featured && !next.draft) {
      const featuredCount = mockProjects.filter(
        (p) => p.id !== next.id && p.featured && !p.draft,
      ).length + 1;
      if (featuredCount > 3) {
        warnings.push({
          code: "FEATURED_LIMIT",
          message: "More than 3 featured",
        });
      }
    }
    next.warnings = warnings.length ? warnings : undefined;
    mockProjects[index] = next;
    return { project: next };
  }

  return apiFetch<{ project: Project }>(`/admin/projects/${idOrSlug}`, {
    method: "PATCH",
    body: input,
  });
}

export async function setProjectGallery(
  idOrSlug: string,
  mediaIds: string[],
): Promise<{ project: Project }> {
  if (useApiMock()) {
    const index = mockProjects.findIndex(
      (p) => p.id === idOrSlug || p.slug === idOrSlug,
    );
    if (index < 0) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Project not found", 404);
    }
    const existing = mockProjects[index];
    const prevById = new Map((existing.gallery ?? []).map((g) => [g.id, g]));
    const gallery = mediaIds.map(
      (id) => prevById.get(id) ?? { id, url: undefined },
    );
    let cover = existing.cover;
    if (cover && !mediaIds.includes(cover.id)) {
      cover = gallery[0] ?? null;
    }
    if (!cover && gallery[0]) cover = gallery[0];
    const next = { ...existing, gallery, cover };
    mockProjects[index] = next;
    return { project: next };
  }

  return apiFetch<{ project: Project }>(`/admin/projects/${idOrSlug}/gallery`, {
    method: "PUT",
    body: { mediaIds },
  });
}

export async function setProjectCover(
  idOrSlug: string,
  mediaId: string | null,
): Promise<{ project: Project }> {
  if (useApiMock()) {
    const index = mockProjects.findIndex(
      (p) => p.id === idOrSlug || p.slug === idOrSlug,
    );
    if (index < 0) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Project not found", 404);
    }
    const existing = mockProjects[index];
    const cover = mediaId
      ? existing.gallery?.find((g) => g.id === mediaId) ?? { id: mediaId }
      : null;
    const next = { ...existing, cover };
    mockProjects[index] = next;
    return { project: next };
  }

  return apiFetch<{ project: Project }>(`/admin/projects/${idOrSlug}/cover`, {
    method: "PUT",
    body: { mediaId },
  });
}

export async function deleteProject(idOrSlug: string): Promise<void> {
  if (useApiMock()) {
    mockProjects = mockProjects.filter(
      (p) => p.id !== idOrSlug && p.slug !== idOrSlug,
    );
    return;
  }

  await apiFetch<void>(`/admin/projects/${idOrSlug}`, { method: "DELETE" });
}

export function projectPublicUrl(slug: string, locale: "ar" | "en" = "ar"): string {
  const base = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}/${locale}/projects/${slug}`;
}

/** Simple kebab slug from Latin text; falls back to timestamp for Arabic-only. */
export function slugifyProjectTitle(title: string): string {
  const latin = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (latin.length > 0) return latin.slice(0, 60);
  return `project-${Date.now().toString(36)}`;
}
