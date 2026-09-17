"use client";

import { Switch } from "@/components/forms/Switch";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import type { CtaLocaleBlock, CtaSettings } from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";

function localeBlock(
  draft: CtaSettings,
  locale: "ar" | "en",
): CtaLocaleBlock {
  return draft[locale] ?? {};
}

export function CtaSettingsForm() {
  const {
    locale,
    draft,
    setDraft,
    loading,
    error,
    reload,
    unsavedDialog,
  } = useSettingsEditor<CtaSettings>("cta");

  const block = localeBlock(draft, locale);

  function updateBlock(patch: Partial<CtaLocaleBlock>) {
    setDraft({
      ...draft,
      [locale]: { ...block, ...patch },
    });
  }

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      <Switch
        label={copy.ctaEnable}
        checked={Boolean(draft.enable)}
        onChange={(enable) => setDraft({ ...draft, enable })}
      />
      <TextField
        label={copy.ctaTitle}
        name="cta-title"
        value={block.title ?? ""}
        onChange={(e) => updateBlock({ title: e.target.value })}
      />
      <TextArea
        label={copy.ctaBody}
        name="cta-body"
        value={block.body ?? ""}
        onChange={(e) => updateBlock({ body: e.target.value })}
      />
      <TextField
        label={copy.ctaButtonLabel}
        name="cta-button-label"
        value={block.button_label ?? ""}
        onChange={(e) => updateBlock({ button_label: e.target.value })}
      />
      <TextField
        label={copy.ctaButtonHref}
        name="cta-button-href"
        value={block.button_href ?? ""}
        onChange={(e) => updateBlock({ button_href: e.target.value })}
      />
    </SettingsFormShell>
  );
}
