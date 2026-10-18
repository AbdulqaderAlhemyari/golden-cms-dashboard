"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEditorChrome } from "@/components/editor/EditorChromeContext";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import {
  createService,
  slugifyServiceTitle,
} from "@/lib/api/services";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type LocaleFields = {
  title: string;
  description: string;
};

const emptyLocale = (): LocaleFields => ({
  title: "",
  description: "",
});

export function NewServiceForm() {
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
    return source ? slugifyServiceTitle(source) : "";
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
    mutationFn: createService,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success(copy.serviceCreatedHidden);
      router.replace(`/services/${data.service.id}`);
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
      setFormError(copy.serviceTitleRequired);
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

    mutation.mutate({
      slug: finalSlug,
      draft: true,
      translations: {
        ar: {
          title: arTitle || enTitle,
          description: fieldsByLocale.ar.description,
        },
        en: {
          title: enTitle || arTitle,
          description: fieldsByLocale.en.description,
        },
      },
    });
  }

  const dirty =
    Boolean(current.title) || Boolean(current.description) || Boolean(slug);

  const { dialog: unsavedDialog } = useUnsavedChanges(dirty);

  useEffect(() => {
    register({
      locale,
      setLocale,
      dirty,
      saving: mutation.isPending,
      save,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save identity changes often
  }, [
    locale,
    dirty,
    mutation.isPending,
    register,
    fieldsByLocale,
    slug,
    slugTouched,
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
            label={copy.serviceName}
            name="title"
            placeholder={copy.serviceNamePlaceholder}
            helpText={copy.serviceNameHelp}
            value={current.title}
            onChange={(e) => updateCurrent({ title: e.target.value })}
          />

          <TextArea
            label={copy.description}
            name="description"
            helpText={copy.descriptionHelp}
            rows={4}
            value={current.description}
            onChange={(e) => updateCurrent({ description: e.target.value })}
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
