"use client";

import Link from "next/link";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import type { ApiPageKey } from "@/lib/pages/types";

type PageEditorLinkCardProps = {
  pageKey: ApiPageKey;
};

export function PageEditorLinkCard({ pageKey }: PageEditorLinkCardProps) {
  if (pageKey === "services_index") {
    return (
      <Link
        href="/services"
        className="card-surface block px-5 py-4 transition-colors hover:border-accent"
      >
        <p className="font-semibold text-foreground">{copy.editServicesList}</p>
        <p className="mt-1 text-sm text-muted">{fields.editServicesListHint}</p>
      </Link>
    );
  }

  if (pageKey === "projects_index") {
    return (
      <Link
        href="/projects"
        className="card-surface block px-5 py-4 transition-colors hover:border-accent"
      >
        <p className="font-semibold text-foreground">{copy.editProjectsList}</p>
        <p className="mt-1 text-sm text-muted">{fields.editProjectsListHint}</p>
      </Link>
    );
  }

  return null;
}
