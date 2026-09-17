import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";

export type ProjectListItem = {
  id: string;
  slug: string;
  draft: boolean;
  featured: boolean;
  title?: string | null;
};

export type ProjectListResponse = {
  items: ProjectListItem[];
};

export type ProjectCounts = {
  visible: number;
  hidden: number;
  featured: number;
  total: number;
};

type ListProjectsParams = {
  locale?: "ar" | "en";
  draft?: "all" | "true" | "false";
  featured?: "all" | "true" | "false";
  q?: string;
};

export async function listProjects(
  params: ListProjectsParams = {},
): Promise<ProjectListResponse> {
  if (useApiMock()) {
    return {
      items: [
        { id: "1", slug: "a", draft: false, featured: true, title: "A" },
        { id: "2", slug: "b", draft: false, featured: true, title: "B" },
        { id: "3", slug: "c", draft: false, featured: true, title: "C" },
        { id: "4", slug: "d", draft: false, featured: false, title: "D" },
        { id: "5", slug: "e", draft: true, featured: false, title: "E" },
      ],
    };
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
