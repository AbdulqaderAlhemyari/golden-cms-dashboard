"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/feedback/StatusPill";
import {
  publishProject,
  unpublishProject,
  projectPublicUrl,
  type Project,
} from "@/lib/api/projects";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type ProjectCardProps = {
  project: Project;
  onUpdated: (project: Project) => void;
};

export function ProjectCard({ project, onUpdated }: ProjectCardProps) {
  const [busy, setBusy] = useState(false);
  const title = project.title || project.translations?.ar?.title || project.slug;
  const coverUrl = project.cover?.url;
  const canShowOnWebsite = Boolean(project.cover?.id);
  const blockPublish = project.draft && !canShowOnWebsite;

  async function toggleVisibility() {
    if (blockPublish) {
      toast.error(copy.missingMainPhoto);
      return;
    }
    setBusy(true);
    try {
      const result = project.draft
        ? await publishProject(project.id)
        : await unpublishProject(project.id);
      onUpdated(result.project);
      toast.success(
        result.project.draft ? copy.hideFromWebsite : copy.showOnWebsite,
      );
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card-surface flex flex-col overflow-hidden">
      <div className="aspect-[16/10] bg-slate-100">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            {copy.mainPhoto}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="text-base font-bold text-foreground">{title}</h2>

        <div className="flex flex-wrap gap-2">
          <StatusPill variant={project.draft ? "hidden" : "visible"} />
          {project.featured && !project.draft ? (
            <StatusPill variant="onHome" />
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex flex-wrap gap-2">
            <Link href={`/projects/${project.id}`} className="btn-secondary">
              {copy.edit}
            </Link>
            <a
              href={projectPublicUrl(project.slug, "ar")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              {copy.viewOnWebsite}
            </a>
            <button
              type="button"
              className="btn-ghost"
              disabled={busy || blockPublish}
              onClick={() => void toggleVisibility()}
            >
              {busy
                ? project.draft
                  ? copy.showingOnWebsite
                  : copy.hidingFromWebsite
                : project.draft
                  ? copy.showOnWebsite
                  : copy.hideFromWebsite}
            </button>
          </div>
          {blockPublish ? (
            <p className="text-xs text-danger">{copy.missingMainPhoto}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
