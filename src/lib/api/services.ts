import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";
import type { MediaRefObject } from "@/lib/api/projects";

export type ScopeItem = {
  title?: string;
  description?: string;
};

export type ServiceTranslation = {
  title: string;
  description?: string;
  details?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  introduction?: string;
  scope?: ScopeItem[];
  standards?: string;
  methodology?: string[];
  imageSide?: "left" | "right" | null;
};

export type ServiceMedia = {
  card: MediaRefObject | null;
  banner: MediaRefObject | null;
  gallery: MediaRefObject[];
};

export type Service = {
  id: string;
  slug: string;
  sortOrder: number;
  draft: boolean;
  publishedAt?: string | null;
  title?: string | null;
  translations?: {
    ar?: ServiceTranslation;
    en?: ServiceTranslation;
  };
  media?: ServiceMedia;
};

export type ServiceListResponse = {
  items: Service[];
};

export type UpdateServiceInput = {
  slug?: string;
  sortOrder?: number;
  draft?: boolean;
  translations?: {
    ar?: Partial<ServiceTranslation>;
    en?: Partial<ServiceTranslation>;
  };
};

export type ServiceMediaPut = {
  card?: string | null;
  banner?: string | null;
  gallery?: string[];
};

function emptyTranslation(title: string): ServiceTranslation {
  return {
    title,
    description: "",
    details: [],
    introduction: "",
    scope: [],
    standards: "",
    methodology: [],
    imageSide: "right",
    metaTitle: null,
    metaDescription: null,
  };
}

let mockServices: Service[] = [
  {
    id: "svc-1",
    slug: "inspection",
    sortOrder: 0,
    draft: false,
    title: "الفحص والمعاينة",
    translations: {
      ar: {
        ...emptyTranslation("الفحص والمعاينة"),
        description: "خدمات فحص ومعاينة بمعايير معتمدة.",
        details: ["فحص ميداني", "تقارير مفصّلة"],
        introduction: "نقدّم حلول فحص شاملة.",
        scope: [{ title: "النطاق", description: "منشآت صناعية" }],
        standards: "ISO 17020",
        methodology: ["تخطيط", "تنفيذ", "تقرير"],
        imageSide: "right",
      },
      en: {
        ...emptyTranslation("Inspection"),
        description: "Accredited inspection services.",
        details: ["On-site inspection", "Detailed reports"],
        introduction: "We provide complete inspection solutions.",
        scope: [{ title: "Scope", description: "Industrial facilities" }],
        standards: "ISO 17020",
        methodology: ["Plan", "Execute", "Report"],
        imageSide: "right",
      },
    },
    media: { card: null, banner: null, gallery: [] },
  },
  {
    id: "svc-2",
    slug: "calibration",
    sortOrder: 1,
    draft: false,
    title: "المعايرة",
    translations: {
      ar: {
        ...emptyTranslation("المعايرة"),
        description: "معايرة أجهزة القياس.",
        details: ["معايرة دورية"],
        introduction: "دقة موثوقة لأجهزتكم.",
        methodology: ["استلام", "معايرة", "تسليم"],
        imageSide: "left",
      },
      en: {
        ...emptyTranslation("Calibration"),
        description: "Measuring instrument calibration.",
        details: ["Periodic calibration"],
        introduction: "Trusted accuracy for your instruments.",
        methodology: ["Receive", "Calibrate", "Deliver"],
        imageSide: "left",
      },
    },
    media: { card: null, banner: null, gallery: [] },
  },
  {
    id: "svc-3",
    slug: "training",
    sortOrder: 2,
    draft: true,
    title: "التدريب",
    translations: {
      ar: {
        ...emptyTranslation("التدريب"),
        description: "برامج تدريب متخصصة.",
        details: ["دورات معتمدة"],
        introduction: "بناء قدرات فرق العمل.",
        methodology: ["تقييم", "تدريب", "شهادة"],
        imageSide: "right",
      },
      en: {
        ...emptyTranslation("Training"),
        description: "Specialized training programs.",
        details: ["Accredited courses"],
        introduction: "Build your team capabilities.",
        methodology: ["Assess", "Train", "Certify"],
        imageSide: "right",
      },
    },
    media: { card: null, banner: null, gallery: [] },
  },
];

type ListParams = {
  locale?: "ar" | "en";
  draft?: "all" | "true" | "false";
  q?: string;
};

export async function listServices(
  params: ListParams = {},
): Promise<ServiceListResponse> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    let items = [...mockServices].sort((a, b) => a.sortOrder - b.sortOrder);
    if (params.draft === "true") items = items.filter((s) => s.draft);
    if (params.draft === "false") items = items.filter((s) => !s.draft);
    if (params.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      items = items.filter(
        (s) =>
          (s.title ?? "").toLowerCase().includes(q) ||
          s.slug.includes(q) ||
          (s.translations?.ar?.title ?? "").toLowerCase().includes(q) ||
          (s.translations?.en?.title ?? "").toLowerCase().includes(q),
      );
    }
    return { items };
  }

  const search = new URLSearchParams();
  search.set("locale", params.locale ?? "ar");
  search.set("draft", params.draft ?? "all");
  if (params.q?.trim()) search.set("q", params.q.trim());

  return apiFetch<ServiceListResponse>(`/admin/services?${search.toString()}`, {
    method: "GET",
  });
}

export async function getService(
  idOrSlug: string,
  locale: "ar" | "en" = "ar",
): Promise<{ service: Service }> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 150));
    const service = mockServices.find(
      (s) => s.id === idOrSlug || s.slug === idOrSlug,
    );
    if (!service) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Service not found", 404);
    }
    return { service };
  }

  return apiFetch<{ service: Service }>(
    `/admin/services/${idOrSlug}?locale=${locale}`,
    { method: "GET" },
  );
}

export async function updateService(
  idOrSlug: string,
  input: UpdateServiceInput,
): Promise<{ service: Service }> {
  if (useApiMock()) {
    await new Promise((r) => setTimeout(r, 250));
    const index = mockServices.findIndex(
      (s) => s.id === idOrSlug || s.slug === idOrSlug,
    );
    if (index < 0) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Service not found", 404);
    }
    const existing = mockServices[index];
    const next: Service = {
      ...existing,
      slug: input.slug ?? existing.slug,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      draft: input.draft ?? existing.draft,
      translations: {
        ar: {
          ...emptyTranslation(""),
          ...existing.translations?.ar,
          ...input.translations?.ar,
        },
        en: {
          ...emptyTranslation(""),
          ...existing.translations?.en,
          ...input.translations?.en,
        },
      },
    };
    next.title =
      next.translations?.ar?.title || next.translations?.en?.title || next.title;
    mockServices[index] = next;
    return { service: next };
  }

  return apiFetch<{ service: Service }>(`/admin/services/${idOrSlug}`, {
    method: "PATCH",
    body: input,
  });
}

export async function setServiceMedia(
  idOrSlug: string,
  media: ServiceMediaPut,
): Promise<{ service: Service }> {
  if (useApiMock()) {
    const index = mockServices.findIndex(
      (s) => s.id === idOrSlug || s.slug === idOrSlug,
    );
    if (index < 0) {
      const { ApiError } = await import("@/lib/errors/mapApiError");
      throw new ApiError("NOT_FOUND", "Service not found", 404);
    }
    const existing = mockServices[index];
    const current = existing.media ?? {
      card: null,
      banner: null,
      gallery: [],
    };
    const nextMedia: ServiceMedia = {
      card:
        media.card === undefined
          ? current.card
          : media.card
            ? { id: media.card, url: current.card?.url }
            : null,
      banner:
        media.banner === undefined
          ? current.banner
          : media.banner
            ? { id: media.banner, url: current.banner?.url }
            : null,
      gallery:
        media.gallery === undefined
          ? current.gallery
          : media.gallery.map((id) => {
              const prev = current.gallery.find((g) => g.id === id);
              return prev ?? { id };
            }),
    };
    const next = { ...existing, media: nextMedia };
    mockServices[index] = next;
    return { service: next };
  }

  return apiFetch<{ service: Service }>(`/admin/services/${idOrSlug}/media`, {
    method: "PUT",
    body: media,
  });
}

export async function publishService(
  idOrSlug: string,
): Promise<{ service: Service }> {
  if (useApiMock()) {
    mockServices = mockServices.map((s) =>
      s.id === idOrSlug || s.slug === idOrSlug
        ? { ...s, draft: false, publishedAt: new Date().toISOString() }
        : s,
    );
    const service = mockServices.find(
      (s) => s.id === idOrSlug || s.slug === idOrSlug,
    )!;
    return { service };
  }

  return apiFetch<{ service: Service }>(
    `/admin/services/${idOrSlug}/publish`,
    { method: "POST", body: {} },
  );
}

export async function unpublishService(
  idOrSlug: string,
): Promise<{ service: Service }> {
  if (useApiMock()) {
    mockServices = mockServices.map((s) =>
      s.id === idOrSlug || s.slug === idOrSlug
        ? { ...s, draft: true, publishedAt: null }
        : s,
    );
    const service = mockServices.find(
      (s) => s.id === idOrSlug || s.slug === idOrSlug,
    )!;
    return { service };
  }

  return apiFetch<{ service: Service }>(
    `/admin/services/${idOrSlug}/unpublish`,
    { method: "POST", body: {} },
  );
}

export function servicePublicUrl(
  slug: string,
  locale: "ar" | "en" = "ar",
): string {
  const base = (
    process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}/${locale}/services/${slug}`;
}
