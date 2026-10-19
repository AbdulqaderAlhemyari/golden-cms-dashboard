"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
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
};

const emptyLocale = (): LocaleFields => ({
  title: "",
  client: "",
  location: "",
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
  const [formError, setFormError] = useState<string | null>(null);

  const current = fieldsByLocale[locale];

  const autoSlug = useMemo(() => {
    const source =
      fieldsByLocale.en.title.trim() ||
      fieldsByLocale.ar.title.trim() ||
      "";
    return source ? slugifyProjectTitle(source) : "";
  }, [fieldsByLocale.ar.title, fieldsByLocale.en.title]);

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

    const finalSlug = autoSlug.trim();
    if (!finalSlug) {
      setFormError(copy.slugRequired);
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(finalSlug)) {
      setFormError(copy.slugInvalid);
      return;
    }

    const yearNum = year.trim() ? Number(year) : null;
    if (year.trim() && Number.isNaN(yearNum)) {
      setFormError(copy.saveFailed);
      return;
    }

    mutation.mutate({
      slug: finalSlug,
      year: yearNum,
      featured: false,
      draft: true,
      galleryMediaIds: [],
      coverMediaId: null,
      translations: {
        ar: {
          title: arTitle || enTitle,
          client: fieldsByLocale.ar.client,
          location: fieldsByLocale.ar.location,
          content: "",
          services: [],
        },
        en: {
          title: enTitle || arTitle,
          client: fieldsByLocale.en.client,
          location: fieldsByLocale.en.location,
          content: "",
          services: [],
        },
      },
    });
  }

  const dirty =
    Boolean(current.title) ||
    Boolean(current.client) ||
    Boolean(current.location) ||
    Boolean(year);

  const { dialog: unsavedDialog } = useUnsavedChanges(dirty);

  useEffect(() => {
    register({
      locale,
      setLocale,
      dirty,
      saving: mutation.isPending,
      save,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save identity changes often; register latest via closure
  }, [
    locale,
    dirty,
    mutation.isPending,
    register,
    fieldsByLocale,
    year,
  ]);

  useEffect(() => {
    return () => register(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger"
            role="alert"
          >
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
              checkScript={false}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </section>
      </div>
    </>
  );
}
