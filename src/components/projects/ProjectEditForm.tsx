"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import { ImageGallery, type GalleryItem } from "@/components/forms/ImageGallery";
import { RichTextField } from "@/components/forms/RichTextField";
import { Switch } from "@/components/forms/Switch";
import { TagInput } from "@/components/forms/TagInput";
import { TextField } from "@/components/forms/TextField";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import {
  deleteProject,
  getProject,
  getProjectCounts,
  publishProject,
  projectPublicUrl,
  setProjectCover,
  setProjectGallery,
  unpublishProject,
  updateProject,
  type ProjectTranslation,
} from "@/lib/api/projects";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import { mapApiError } from "@/lib/errors/mapApiError";

type TabKey = "basics" | "description" | "photos" | "seo";

const tabs: Array<{ key: TabKey; label: string; collapsed?: boolean }> = [
  { key: "basics", label: copy.basics },
  { key: "description", label: copy.description },
  { key: "photos", label: copy.photos },
  { key: "seo", label: copy.nav.seoAppearance, collapsed: true },
];

type LocaleFields = ProjectTranslation;

const emptyLocale = (): LocaleFields => ({
  title: "",
  client: "",
  location: "",
  content: "",
  services: [],
});

type ProjectEditFormProps = {
  projectId: string;
};

export function ProjectEditForm({ projectId }: ProjectEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register } = useEditorChrome();

  const [tab, setTab] = useState<TabKey>("basics");
  const [locale, setLocale] = useState<ContentLocale>("ar");
  const [fieldsByLocale, setFieldsByLocale] = useState<
    Record<ContentLocale, LocaleFields>
  >({ ar: emptyLocale(), en: emptyLocale() });
  const [year, setYear] = useState("");
  const [slug, setSlug] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [visibilityBusy, setVisibilityBusy] = useState(false);

  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId, "ar"),
  });

  const countsQuery = useQuery({
    queryKey: ["project-counts"],
    queryFn: getProjectCounts,
  });

  useEffect(() => {
    const project = query.data?.project;
    if (!project) return;

    const ar = {
      ...emptyLocale(),
      ...project.translations?.ar,
      title:
        project.translations?.ar?.title ||
        project.title ||
        "",
    };
    const en = {
      ...emptyLocale(),
      ...project.translations?.en,
    };
    setFieldsByLocale({ ar, en });
    setYear(project.year != null ? String(project.year) : "");
    setSlug(project.slug);
    setFeatured(project.featured);
    setPublished(!project.draft);
    const galleryItems: GalleryItem[] = (project.gallery ?? []).map((g) => ({
      id: g.id,
      url: g.url,
    }));
    setGallery(galleryItems);
    setCoverId(project.cover?.id ?? galleryItems[0]?.id ?? null);

    setBaseline(
      JSON.stringify({
        ar,
        en,
        year: project.year,
        slug: project.slug,
        featured: project.featured,
        published: !project.draft,
        galleryIds: galleryItems.map((g) => g.id),
        coverId: project.cover?.id ?? galleryItems[0]?.id ?? null,
      }),
    );
  }, [query.data]);

  const current = fieldsByLocale[locale];

  const dirty = useMemo(() => {
    if (!baseline) return false;
    const now = JSON.stringify({
      ar: fieldsByLocale.ar,
      en: fieldsByLocale.en,
      year: year.trim() ? Number(year) : null,
      slug,
      featured,
      published,
      galleryIds: gallery.map((g) => g.id),
      coverId,
    });
    return now !== baseline;
  }, [baseline, fieldsByLocale, year, slug, featured, published, gallery, coverId]);

  const featuredWarningVisible = useMemo(() => {
    if (!featured || !published) return false;
    const others = countsQuery.data?.featured ?? 0;
    // counts include current if already featured+published; soft-cap is 3
    return others >= 3;
  }, [featured, published, countsQuery.data?.featured]);

  function updateCurrent(patch: Partial<LocaleFields>) {
    setFieldsByLocale((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const yearNum = year.trim() ? Number(year) : null;
      if (year.trim() && Number.isNaN(yearNum)) {
        throw new Error("bad year");
      }

      const updated = await updateProject(projectId, {
        slug,
        year: yearNum,
        featured,
        draft: !published,
        coverMediaId: coverId,
        translations: {
          ar: fieldsByLocale.ar,
          en: fieldsByLocale.en,
        },
      });

      await setProjectGallery(
        projectId,
        gallery.map((g) => g.id),
      );
      await setProjectCover(projectId, coverId);

      if (updated.project.warnings?.some((w) => w.code === "FEATURED_LIMIT")) {
        toast.message(copy.featuredWarning);
      }

      return updated;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["project-counts"] });
      toast.success(copy.saved);
    },
    onError: (error) => {
      toast.error(mapApiError(error));
    },
  });

  async function toggleVisibility() {
    setVisibilityBusy(true);
    try {
      const result = published
        ? await unpublishProject(projectId)
        : await publishProject(projectId);
      setPublished(!result.project.draft);
      if (result.project.warnings?.length) {
        toast.message(copy.featuredWarning);
      }
      toast.success(
        result.project.draft ? copy.hideFromWebsite : copy.showOnWebsite,
      );
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["project-counts"] });
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setVisibilityBusy(false);
    }
  }

  async function onDelete() {
    try {
      await deleteProject(projectId);
      toast.success(copy.delete);
      router.replace("/projects");
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setConfirmDelete(false);
    }
  }

  const save = () => {
    saveMutation.mutate();
  };

  useEffect(() => {
    register({
      locale,
      setLocale,
      dirty,
      saving: saveMutation.isPending,
      save,
    });
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register, locale, dirty, saveMutation.isPending]);

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

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  tab === item.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted ring-1 ring-border hover:text-foreground",
                )}
              >
                {item.label}
                {item.collapsed ? (
                  <span className="ms-1 text-[10px] font-normal opacity-80">
                    ({copy.moreOptions})
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={projectPublicUrl(slug || query.data.project.slug, locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {copy.viewOnWebsite}
            </a>
            <button
              type="button"
              className="btn-secondary"
              disabled={visibilityBusy}
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
            <button
              type="button"
              className="btn-danger"
              onClick={() => setConfirmDelete(true)}
            >
              {copy.delete}
            </button>
          </div>
        </div>

        <LanguageTabs value={locale} onChange={setLocale} />

        <div className="card-surface p-5 md:p-6">
          {tab === "basics" ? (
            <div className="space-y-5">
              <TextField
                label={copy.projectName}
                name="title"
                value={current.title}
                onChange={(e) => updateCurrent({ title: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label={copy.projectClient}
                  name="client"
                  value={current.client ?? ""}
                  onChange={(e) => updateCurrent({ client: e.target.value })}
                />
                <TextField
                  label={copy.projectLocation}
                  name="location"
                  value={current.location ?? ""}
                  onChange={(e) => updateCurrent({ location: e.target.value })}
                />
                <TextField
                  label={copy.projectYear}
                  name="year"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <TagInput
                label={fields.serviceTags}
                helpText={fields.serviceTagsHelp}
                value={current.services ?? []}
                onChange={(services) => updateCurrent({ services })}
              />
              <Switch
                label={copy.showOnWebsite}
                checked={published}
                onChange={setPublished}
              />
              <Switch
                label={copy.showOnHome}
                checked={featured}
                onChange={setFeatured}
                helpText={
                  featuredWarningVisible ? copy.featuredWarning : undefined
                }
              />
              {featuredWarningVisible ? (
                <p className="text-sm text-primary">{copy.featuredWarning}</p>
              ) : null}
            </div>
          ) : null}

          {tab === "description" ? (
            <RichTextField
              value={current.content ?? ""}
              onChange={(content) => updateCurrent({ content })}
            />
          ) : null}

          {tab === "photos" ? (
            <ImageGallery
              items={gallery}
              coverId={coverId}
              onChange={setGallery}
              onCoverChange={setCoverId}
              uploadFolder={`projects/${slug || projectId}/gallery`}
            />
          ) : null}

          {tab === "seo" ? (
            <div className="space-y-5">
              <p className="text-sm text-muted">{fields.projectSeoHelp}</p>
              <TextField
                label={copy.pageSlug}
                name="slug"
                helpText={copy.pageSlugHelp}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={copy.delete}
        description={copy.confirmDelete}
        confirmLabel={copy.delete}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void onDelete()}
      />
    </>
  );
}
