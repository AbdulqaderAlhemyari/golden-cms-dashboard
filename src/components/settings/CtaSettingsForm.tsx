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
        name="cta-content"
        value={block.content ?? ""}
        onChange={(e) => updateBlock({ content: e.target.value })}
      />
      <TextField
        label={copy.ctaContactLabel}
        name="cta-contact-label"
        helpText={copy.ctaContactHelp}
        value={block.contact_label ?? ""}
        onChange={(e) => updateBlock({ contact_label: e.target.value })}
      />
      <TextField
        label={copy.ctaWhatsappLabel}
        name="cta-whatsapp-label"
        helpText={copy.ctaWhatsappHelp}
        value={block.whatsapp_label ?? ""}
        onChange={(e) => updateBlock({ whatsapp_label: e.target.value })}
      />
    </SettingsFormShell>
  );
}
