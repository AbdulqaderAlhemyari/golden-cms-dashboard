"use client";

import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import type { SocialSettings } from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";

const PLATFORM_ORDER = [
  "facebook",
  "twitter",
  "linkedin",
  "instagram",
  "youtube",
  "tiktok",
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
};

function orderedKeys(draft: SocialSettings): string[] {
  const extras = Object.keys(draft).filter(
    (key) => !(PLATFORM_ORDER as readonly string[]).includes(key),
  );
  return [...PLATFORM_ORDER, ...extras];
}

export function SocialSettingsForm() {
  const { draft, setDraft, loading, error, reload, unsavedDialog } =
    useSettingsEditor<SocialSettings>("social");

  const keys = orderedKeys(draft);

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      {keys.map((key) => (
        <TextField
          key={key}
          label={PLATFORM_LABELS[key] ?? key}
          name={`social-${key}`}
          type="url"
          placeholder="https://"
          value={draft[key] ?? ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              [key]: e.target.value,
            })
          }
          helpText={copy.socialUrl}
        />
      ))}
    </SettingsFormShell>
  );
}
