"use client";

import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import type { ContactSettings } from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";
import { getBilingual, setBilingual } from "@/lib/settings/bilingual";

export function ContactSettingsForm() {
  const {
    locale,
    draft,
    setDraft,
    loading,
    error,
    reload,
    unsavedDialog,
  } = useSettingsEditor<ContactSettings>("contact_info");

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      <p className="text-sm leading-relaxed text-muted">
        {copy.settingsContactHelp}
      </p>
      <TextField
        label={copy.phone}
        name="contact-phone"
        checkScript={false}
        value={draft.phone ?? ""}
        onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
      />
      <TextField
        label={copy.phoneLink}
        name="contact-phone-link"
        helpText={copy.phoneLinkHelp}
        checkScript={false}
        value={draft.phone_link ?? ""}
        onChange={(e) => setDraft({ ...draft, phone_link: e.target.value })}
      />
      <TextField
        label={copy.email}
        name="contact-email"
        type="email"
        checkScript={false}
        value={draft.email ?? ""}
        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
      />
      <TextField
        label={copy.whatsapp}
        name="contact-whatsapp"
        checkScript={false}
        value={draft.whatsapp ?? ""}
        onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
      />
      <TextArea
        label={copy.address}
        name="contact-location"
        value={getBilingual(draft.location, locale)}
        onChange={(e) =>
          setDraft({
            ...draft,
            location: setBilingual(draft.location, locale, e.target.value),
          })
        }
      />
      <TextField
        label={copy.taxNumber}
        name="contact-tax"
        checkScript={false}
        value={draft.tax_number ?? ""}
        onChange={(e) => setDraft({ ...draft, tax_number: e.target.value })}
      />
      <TextField
        label={copy.commercialRegister}
        name="contact-cr"
        checkScript={false}
        value={draft.commercial_register ?? ""}
        onChange={(e) =>
          setDraft({ ...draft, commercial_register: e.target.value })
        }
      />
    </SettingsFormShell>
  );
}
