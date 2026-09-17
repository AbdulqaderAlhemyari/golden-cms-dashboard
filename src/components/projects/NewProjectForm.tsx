"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import { Switch } from "@/components/forms/Switch";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  createProject,
  slugifyProjectTitle,
} from "@/lib/api/projects";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type LocaleFields = {
  title: string;
  client: string;
  location: string;
  content: string;
};

const emptyLocale = (): LocaleFields => ({
  title: "",
  client: "",
  location: "",
  content: "",
});

export function NewProjectForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { register } = useEditorChrome();

  const [locale, setLocale] = useState<ContentLocale>("ar");
  const [fieldsByLocale, setFieldsByLocale] = useState<
    Record<ContentLocale, LocaleFields>
  >({
    ar: emptyLocale(),
    en: emptyLocale(),
  });
  const [year, setYear] = useState("");
  const [featured, setFeatured] = useState(false);
  const [photoIds, setPhotoIds] = useState<string[]>([""]);
  const [showMore, setShowMore] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const current = fieldsByLocale[locale];

  const autoSlug = useMemo(() => {
    const source =
      fieldsByLocale.en.title.trim() ||
      fieldsByLocale.ar.title.trim() ||
      "";
    return source ? slugifyProjectTitle(source) : "";
  }, [fieldsByLocale.ar.title, fieldsByLocale.en.title]);

  useEffect(() => {
    if (!slugTouched) setSlug(autoSlug);
  }, [autoSlug, slugTouched]);

  function updateCurrent(patch: Partial<LocaleFields>) {
    setFieldsByLocale((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  }

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(copy.projectCreatedHidden);
      router.replace(`/projects/${data.project.id}`);
    },
    onError: (error) => {
      setFormError(mapApiError(error));
    },
  });

  function save() {
    setFormError(null);
    const arTitle = fieldsByLocale.ar.title.trim();
    const enTitle = fieldsByLocale.en.title.trim();
    const title = arTitle || enTitle;

    if (!title) {
      setFormError(copy.titleRequired);
      return;
    }

    const finalSlug = (slugTouched ? slug : autoSlug || slug).trim();
    if (!finalSlug) {
      setFormError(copy.slugRequired);
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setFormError(copy.slugInvalid);
      setShowMore(true);
      return;
    }

    const galleryMediaIds = photoIds.map((id) => id.trim()).filter(Boolean);
    const yearNum = year.trim() ? Number(year) : null;
    if (year.trim() && Number.isNaN(yearNum)) {
      setFormError(copy.saveFailed);
      return;
    }

    mutation.mutate({
      slug: finalSlug,
      year: yearNum,
      featured,
      draft: true,
      galleryMediaIds,
      coverMediaId: galleryMediaIds[0] ?? null,
      translations: {
        ar: {
          title: arTitle || enTitle,
          client: fieldsByLocale.ar.client,
          location: fieldsByLocale.ar.location,
          content: fieldsByLocale.ar.content,
          services: [],
        },
        en: {
          title: enTitle || arTitle,
          client: fieldsByLocale.en.client,
          location: fieldsByLocale.en.location,
          content: fieldsByLocale.en.content,
          services: [],
        },
      },
    });
  }

  const dirty =
    Boolean(current.title) ||
    Boolean(current.content) ||
    Boolean(year) ||
    photoIds.some((id) => id.trim());

  const { dialog: unsavedDialog } = useUnsavedChanges(dirty);

  useEffect(() => {
    register({
      locale,
      setLocale,
      dirty,
      saving: mutation.isPending,
      save,
    });
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save identity changes often; register latest via closure
  }, [locale, dirty, mutation.isPending, register, fieldsByLocale, year, featured, photoIds, slug, slugTouched]);

  return (
    <>
      {unsavedDialog}
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LanguageTabs value={locale} onChange={setLocale} />
        <button
          type="button"
          className="btn-primary"
          disabled={mutation.isPending}
          onClick={save}
        >
          {mutation.isPending ? copy.saving : copy.save}
        </button>
      </div>

      {formError ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <section className="card-surface space-y-5 p-5 md:p-6">
        <h2 className="text-lg font-bold">{copy.basics}</h2>
        <TextField
          label={copy.projectName}
          name="title"
          placeholder={copy.projectNamePlaceholder}
          helpText={copy.projectNameHelp}
          value={current.title}
          onChange={(e) => updateCurrent({ title: e.target.value })}
        />

        <div className="space-y-3">
          <p className="text-sm font-semibold">{copy.projectPhotos}</p>
          <p className="text-xs text-muted">{copy.projectPhotosHelp}</p>
          {photoIds.map((id, index) => (
            <div key={index} className="flex flex-wrap gap-2">
              <div className="min-w-0 flex-1">
                <TextField
                  label={`${copy.projectPhotoId} ${index + 1}`}
                  name={`photo-${index}`}
                  value={id}
                  onChange={(e) => {
                    const next = [...photoIds];
                    next[index] = e.target.value;
                    setPhotoIds(next);
                  }}
                />
              </div>
              {photoIds.length > 1 ? (
                <button
                  type="button"
                  className="btn-ghost text-danger self-end"
                  onClick={() =>
                    setPhotoIds((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  {copy.delete}
                </button>
              ) : null}
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPhotoIds((prev) => [...prev, ""])}
          >
            {copy.addPhotoId}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={copy.projectClient}
            name="client"
            value={current.client}
            onChange={(e) => updateCurrent({ client: e.target.value })}
          />
          <TextField
            label={copy.projectLocation}
            name="location"
            value={current.location}
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

        <Switch
          label={copy.showOnHome}
          checked={featured}
          onChange={setFeatured}
          helpText={copy.featuredWarning}
        />

        <TextArea
          label={copy.description}
          name="description"
          helpText={copy.descriptionHelp}
          rows={5}
          value={current.content}
          onChange={(e) => updateCurrent({ content: e.target.value })}
        />

        <div className="border-t border-border pt-4">
          <button
            type="button"
            className="btn-ghost px-0"
            onClick={() => setShowMore((v) => !v)}
          >
            {copy.moreOptions}
          </button>
          {showMore ? (
            <div className="mt-3">
              <TextField
                label={copy.pageSlug}
                name="slug"
                helpText={copy.pageSlugHelp}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </div>
          ) : null}
        </div>
      </section>
    </div>
    </>
  );
}
