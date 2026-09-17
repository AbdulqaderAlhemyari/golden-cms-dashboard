"use client";

import { ImageField } from "@/components/forms/ImageField";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import type { SeoSettings } from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";

export function SeoSettingsForm() {
  const { draft, setDraft, loading, error, reload, unsavedDialog } =
    useSettingsEditor<SeoSettings>("seo");

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      <TextField
        label={copy.seoDefaultTitle}
        name="seo-meta-title"
        value={draft.meta_title ?? ""}
        onChange={(e) => setDraft({ ...draft, meta_title: e.target.value })}
      />
      <TextArea
        label={copy.seoDefaultDescription}
        name="seo-meta-description"
        value={draft.meta_description ?? ""}
        onChange={(e) =>
          setDraft({ ...draft, meta_description: e.target.value })
        }
      />
      <ImageField
        label={copy.seoDefaultImage}
        value={draft.meta_image}
        onChange={(meta_image) => setDraft({ ...draft, meta_image })}
      />
      <TextField
        label={copy.seoAuthor}
        name="seo-meta-author"
        value={draft.meta_author ?? ""}
        onChange={(e) => setDraft({ ...draft, meta_author: e.target.value })}
      />
    </SettingsFormShell>
  );
}
