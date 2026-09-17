"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import { ImageGallery, type GalleryItem } from "@/components/forms/ImageGallery";
import { RichTextField } from "@/components/forms/RichTextField";
import { SingleImageUpload } from "@/components/forms/SingleImageUpload";
import { Switch } from "@/components/forms/Switch";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  getService,
  publishService,
  servicePublicUrl,
  setServiceMedia,
  unpublishService,
  updateService,
  type ScopeItem,
  type ServiceTranslation,
} from "@/lib/api/services";
import type { MediaRef } from "@/lib/pages/types";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type TabKey = "card" | "detail" | "photos";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "card", label: copy.serviceCardTab },
  { key: "detail", label: copy.serviceDetailTab },
  { key: "photos", label: copy.photos },
];

const emptyLocale = (): ServiceTranslation => ({
  title: "",
  description: "",
  details: [],
  introduction: "",
  scope: [],
  standards: "",
  methodology: [],
  imageSide: "right",
  metaTitle: null,
  metaDescription: null,
});

function toMediaRef(
  value: { id: string; url?: string } | null | undefined,
): MediaRef {
  if (!value) return null;
  return { id: value.id, url: value.url };
}

function mediaIdOf(value: MediaRef): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id;
}

type ServiceEditFormProps = {
  serviceId: string;
};

export function ServiceEditForm({ serviceId }: ServiceEditFormProps) {
  const queryClient = useQueryClient();
  const { register } = useEditorChrome();

  const [tab, setTab] = useState<TabKey>("card");
  const [locale, setLocale] = useState<ContentLocale>("ar");
  const [fieldsByLocale, setFieldsByLocale] = useState<
    Record<ContentLocale, ServiceTranslation>
  >({ ar: emptyLocale(), en: emptyLocale() });
  const [published, setPublished] = useState(false);
  const [cardImage, setCardImage] = useState<MediaRef>(null);
  const [bannerImage, setBannerImage] = useState<MediaRef>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [baseline, setBaseline] = useState("");
  const [visibilityBusy, setVisibilityBusy] = useState(false);

  const query = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => getService(serviceId, "ar"),
  });

  useEffect(() => {
    const service = query.data?.service;
    if (!service) return;

    const ar = { ...emptyLocale(), ...service.translations?.ar };
    const en = { ...emptyLocale(), ...service.translations?.en };
    setFieldsByLocale({ ar, en });
    setPublished(!service.draft);
    setCardImage(toMediaRef(service.media?.card));
    setBannerImage(toMediaRef(service.media?.banner));
    setGallery(
      (service.media?.gallery ?? []).map((g) => ({
        id: g.id,
        url: g.url,
      })),
    );
    setBaseline(
      JSON.stringify({
        ar,
        en,
        published: !service.draft,
        card: mediaIdOf(toMediaRef(service.media?.card)),
        banner: mediaIdOf(toMediaRef(service.media?.banner)),
        gallery: (service.media?.gallery ?? []).map((g) => g.id),
      }),
    );
  }, [query.data]);

  const current = fieldsByLocale[locale];

  const dirty = useMemo(() => {
    if (!baseline) return false;
    return (
      JSON.stringify({
        ar: fieldsByLocale.ar,
        en: fieldsByLocale.en,
        published,
        card: mediaIdOf(cardImage),
        banner: mediaIdOf(bannerImage),
        gallery: gallery.map((g) => g.id),
      }) !== baseline
    );
  }, [baseline, fieldsByLocale, published, cardImage, bannerImage, gallery]);

  const { dialog: unsavedDialog } = useUnsavedChanges(dirty);

  const canShowOnWebsite = Boolean(mediaIdOf(cardImage));
  const blockPublish = !published && !canShowOnWebsite;

  function updateCurrent(patch: Partial<ServiceTranslation>) {
    setFieldsByLocale((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateService(serviceId, {
        draft: !published,
        translations: {
          ar: fieldsByLocale.ar,
          en: fieldsByLocale.en,
        },
      });
      await setServiceMedia(serviceId, {
        card: mediaIdOf(cardImage),
        banner: mediaIdOf(bannerImage),
        gallery: gallery.map((g) => g.id),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(copy.saved);
    },
    onError: (error) => toast.error(mapApiError(error)),
  });

  async function toggleVisibility() {
    if (!published && !canShowOnWebsite) {
      toast.error(copy.missingMainPhoto);
      return;
    }
    setVisibilityBusy(true);
    try {
      const result = published
        ? await unpublishService(serviceId)
        : await publishService(serviceId);
      setPublished(!result.service.draft);
      toast.success(
        result.service.draft ? copy.hideFromWebsite : copy.showOnWebsite,
      );
      await queryClient.invalidateQueries({ queryKey: ["service", serviceId] });
      await queryClient.invalidateQueries({ queryKey: ["services"] });
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setVisibilityBusy(false);
    }
  }

  useEffect(() => {
    register({
      locale,
      setLocale,
      dirty,
      saving: saveMutation.isPending,
      save: () => saveMutation.mutate(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, locale, dirty, saveMutation.isPending]);

  useEffect(() => {
    return () => register(null);
  }, [register]);

  if (query.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted">
        {copy.loading}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <p className="text-danger">{mapApiError(query.error)}</p>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => void query.refetch()}
        >
          {copy.confirm}
        </button>
      </div>
    );
  }

  const slug = query.data.service.slug;
  const details = current.details ?? [];
  const scope = current.scope ?? [];
  const methodology = current.methodology ?? [];

  return (
    <>
      {unsavedDialog}
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "min-h-[var(--touch-min)] rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                tab === item.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted ring-1 ring-border hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <a
              href={servicePublicUrl(slug, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {copy.viewOnWebsite}
            </a>
            <button
              type="button"
              className="btn-secondary"
              disabled={visibilityBusy || blockPublish}
              onClick={() => void toggleVisibility()}
            >
              {visibilityBusy
                ? published
                  ? copy.hidingFromWebsite
                  : copy.showingOnWebsite
                : published
                  ? copy.hideFromWebsite
                  : copy.showOnWebsite}
            </button>
          </div>
          {blockPublish ? (
            <p className="text-xs text-danger">{copy.missingMainPhoto}</p>
          ) : null}
        </div>
      </div>

      <LanguageTabs value={locale} onChange={setLocale} />

      <div className="card-surface p-5 md:p-6">
        {tab === "card" ? (
          <div className="space-y-5">
            <TextField
              label={copy.serviceName}
              name="title"
              value={current.title}
              onChange={(e) => updateCurrent({ title: e.target.value })}
            />
            <TextArea
              label={copy.description}
              name="description"
              value={current.description ?? ""}
              onChange={(e) => updateCurrent({ description: e.target.value })}
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold">{copy.serviceDetailsList}</p>
              {details.map((line, index) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={`${copy.serviceStep} ${index + 1}`}
                      name={`detail-${index}`}
                      value={line}
                      onChange={(e) => {
                        const next = [...details];
                        next[index] = e.target.value;
                        updateCurrent({ details: next });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-ghost text-danger self-end"
                    onClick={() =>
                      updateCurrent({
                        details: details.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {copy.delete}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => updateCurrent({ details: [...details, ""] })}
              >
                {copy.serviceAddDetail}
              </button>
            </div>

            <SingleImageUpload
              label={copy.serviceCardImage}
              value={cardImage}
              onChange={setCardImage}
              folder={`services/${slug}/card`}
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold">{copy.photoOnLeft} / {copy.photoOnRight}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold",
                    current.imageSide === "left"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface ring-1 ring-border",
                  )}
                  onClick={() => updateCurrent({ imageSide: "left" })}
                >
                  {copy.photoOnLeft}
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold",
                    current.imageSide !== "left"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface ring-1 ring-border",
                  )}
                  onClick={() => updateCurrent({ imageSide: "right" })}
                >
                  {copy.photoOnRight}
                </button>
              </div>
            </div>

            <Switch
              label={copy.showOnWebsite}
              checked={published}
              disabled={blockPublish}
              helpText={blockPublish ? copy.missingMainPhoto : undefined}
              onChange={(checked) => {
                if (checked && !canShowOnWebsite) return;
                setPublished(checked);
              }}
            />
          </div>
        ) : null}

        {tab === "detail" ? (
          <div className="space-y-5">
            <SingleImageUpload
              label={copy.serviceBanner}
              value={bannerImage}
              onChange={setBannerImage}
              folder={`services/${slug}/banner`}
            />
            <RichTextField
              label={copy.serviceIntroduction}
              value={current.introduction ?? ""}
              onChange={(introduction) => updateCurrent({ introduction })}
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold">{copy.serviceScope}</p>
              {scope.map((item, index) => (
                <div key={index} className="card-surface space-y-3 p-4">
                  <TextField
                    label={copy.serviceScopeTitle}
                    name={`scope-title-${index}`}
                    value={item.title ?? ""}
                    onChange={(e) => {
                      const next: ScopeItem[] = scope.map((s, i) =>
                        i === index ? { ...s, title: e.target.value } : s,
                      );
                      updateCurrent({ scope: next });
                    }}
                  />
                  <TextArea
                    label={copy.serviceScopeDescription}
                    name={`scope-desc-${index}`}
                    value={item.description ?? ""}
                    onChange={(e) => {
                      const next: ScopeItem[] = scope.map((s, i) =>
                        i === index ? { ...s, description: e.target.value } : s,
                      );
                      updateCurrent({ scope: next });
                    }}
                  />
                  <button
                    type="button"
                    className="btn-ghost text-danger"
                    onClick={() =>
                      updateCurrent({
                        scope: scope.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {copy.delete}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  updateCurrent({
                    scope: [...scope, { title: "", description: "" }],
                  })
                }
              >
                {copy.serviceAddScope}
              </button>
            </div>

            <TextArea
              label={copy.serviceStandards}
              name="standards"
              value={current.standards ?? ""}
              onChange={(e) => updateCurrent({ standards: e.target.value })}
            />

            <div className="space-y-3">
              <p className="text-sm font-semibold">{copy.serviceMethodology}</p>
              {methodology.map((step, index) => (
                <div key={index} className="flex flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <TextField
                      label={`${copy.serviceStep} ${index + 1}`}
                      name={`method-${index}`}
                      value={step}
                      onChange={(e) => {
                        const next = [...methodology];
                        next[index] = e.target.value;
                        updateCurrent({ methodology: next });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-ghost text-danger self-end"
                    onClick={() =>
                      updateCurrent({
                        methodology: methodology.filter((_, i) => i !== index),
                      })
                    }
                  >
                    {copy.delete}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  updateCurrent({ methodology: [...methodology, ""] })
                }
              >
                {copy.serviceAddStep}
              </button>
            </div>

            <TextField
              label={copy.serviceMetaTitle}
              name="meta-title"
              value={current.metaTitle ?? ""}
              onChange={(e) => updateCurrent({ metaTitle: e.target.value })}
            />
            <TextArea
              label={copy.serviceMetaDescription}
              name="meta-description"
              value={current.metaDescription ?? ""}
              onChange={(e) =>
                updateCurrent({ metaDescription: e.target.value })
              }
            />
          </div>
        ) : null}

        {tab === "photos" ? (
          <ImageGallery
            items={gallery}
            coverId={gallery[0]?.id ?? null}
            onChange={setGallery}
            onCoverChange={() => undefined}
            uploadFolder={`services/${slug}/gallery`}
          />
        ) : null}
      </div>
    </div>
    </>
  );
}
