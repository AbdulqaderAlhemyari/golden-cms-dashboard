"use client";

import { ImageField } from "@/components/forms/ImageField";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import type { SeoSettings } from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";
import { getBilingual, setBilingual } from "@/lib/settings/bilingual";

export function SeoSettingsForm() {
  const { locale, draft, setDraft, loading, error, reload, unsavedDialog } =
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
        value={getBilingual(draft.meta_title, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            meta_title: setBilingual(draft.meta_title, locale, e.target.value),
          })
        }
      />
      <TextArea
        label={copy.seoDefaultDescription}
        name="seo-meta-description"
        value={getBilingual(draft.meta_description, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            meta_description: setBilingual(
              draft.meta_description,
              locale,
              e.target.value,
            ),
          })
        }
      />
      <ImageField
        label={copy.seoDefaultImage}
        folder="branding"
        value={draft.meta_image}
        onChange={(meta_image) => setDraft({ ...draft, meta_image })}
      />
      <TextField
        label={copy.seoAuthor}
        name="seo-meta-author"
        value={getBilingual(draft.meta_author, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            meta_author: setBilingual(
              draft.meta_author,
              locale,
              e.target.value,
            ),
          })
        }
      />
    </SettingsFormShell>
  );
}
