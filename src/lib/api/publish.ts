import { apiFetch } from "@/lib/api/client";
import { useApiMock } from "@/lib/api/mock";

export type RevalidateWebsiteResponse = {
  ok: boolean;
  websiteStatus: number;
  tags: string[];
  eventId: string;
};

export async function revalidateWebsite(
  tags?: string[],
): Promise<RevalidateWebsiteResponse> {
  if (useApiMock()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      ok: true,
      websiteStatus: 200,
      tags: tags ?? [
        "settings",
        "menus",
        "home",
        "about",
        "services",
        "projects",
        "contact",
        "terms",
        "not_found",
      ],
      eventId: "mock-revalidate",
    };
  }

  return apiFetch<RevalidateWebsiteResponse>(
    "/admin/publish/revalidate-website",
    {
      method: "POST",
      body: tags ? { tags } : {},
    },
  );
}
