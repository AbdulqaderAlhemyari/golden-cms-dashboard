"use client";

import { ImageField } from "@/components/forms/ImageField";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import type { SiteSettings } from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";
import { getBilingual, setBilingual } from "@/lib/settings/bilingual";

export function SiteSettingsForm() {
  const {
    locale,
    draft,
    setDraft,
    loading,
    error,
    reload,
    unsavedDialog,
  } = useSettingsEditor<SiteSettings>("site");

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      <TextField
        label={copy.siteName}
        name="site-title"
        value={getBilingual(draft.title, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            title: setBilingual(draft.title, locale, e.target.value),
          })
        }
      />
      <TextField
        label={copy.logoText}
        name="site-logo-text"
        value={getBilingual(draft.logo_text, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            logo_text: setBilingual(draft.logo_text, locale, e.target.value),
          })
        }
      />
      <ImageField
        label={copy.logoImage}
        value={draft.logo}
        onChange={(logo) => setDraft({ ...draft, logo })}
      />
      <ImageField
        label={copy.favicon}
        value={draft.favicon}
        onChange={(favicon) => setDraft({ ...draft, favicon })}
      />
      <TextArea
        label={copy.footerContent}
        name="site-footer"
        value={getBilingual(draft.footer_content, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            footer_content: setBilingual(
              draft.footer_content,
              locale,
              e.target.value,
            ),
          })
        }
      />
      <TextField
        label={copy.copyright}
        name="site-copyright"
        value={getBilingual(draft.copyright, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            copyright: setBilingual(draft.copyright, locale, e.target.value),
          })
        }
      />
    </SettingsFormShell>
  );
}
