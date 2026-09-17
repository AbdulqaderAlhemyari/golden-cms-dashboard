"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { StatusPill } from "@/components/feedback/StatusPill";
import {
  publishService,
  unpublishService,
  servicePublicUrl,
  type Service,
} from "@/lib/api/services";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type ServiceCardProps = {
  service: Service;
  onUpdated: (service: Service) => void;
};

export function ServiceCard({ service, onUpdated }: ServiceCardProps) {
  const [busy, setBusy] = useState(false);
  const title =
    service.title || service.translations?.ar?.title || service.slug;
  const coverUrl = service.media?.card?.url;
  const canShowOnWebsite = Boolean(service.media?.card?.id);
  const blockPublish = service.draft && !canShowOnWebsite;

  async function toggleVisibility() {
    if (blockPublish) {
      toast.error(copy.missingMainPhoto);
      return;
    }
    setBusy(true);
    try {
      const result = service.draft
        ? await publishService(service.id)
        : await unpublishService(service.id);
      onUpdated(result.service);
      toast.success(
        result.service.draft ? copy.hideFromWebsite : copy.showOnWebsite,
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
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            {copy.mainPhoto}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <StatusPill variant={service.draft ? "hidden" : "visible"} />
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex flex-wrap gap-2">
            <Link href={`/services/${service.id}`} className="btn-secondary">
              {copy.edit}
            </Link>
            <a
              href={servicePublicUrl(service.slug, "ar")}
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
                ? service.draft
                  ? copy.showingOnWebsite
                  : copy.hidingFromWebsite
                : service.draft
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
