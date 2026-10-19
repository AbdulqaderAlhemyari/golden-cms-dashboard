"use client";

import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useSettingsEditor } from "@/hooks/useSettingsEditor";
import {
  SOCIAL_PLATFORM_KEYS,
  normalizeSocialSettings,
  type SocialPlatformEntry,
  type SocialPlatformKey,
  type SocialSettings,
} from "@/lib/api/settings";
import { copy } from "@/lib/copy/ar";
import { getBilingual, setBilingual } from "@/lib/settings/bilingual";

const PLATFORM_ADMIN_LABELS: Record<SocialPlatformKey, string> = {
  twitter: "X",
  facebook: "Facebook",
  instagram: "Instagram",
  snapchat: "Snapchat",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
};

export function SocialSettingsForm() {
  const {
    locale,
    draft,
    setDraft,
    loading,
    error,
    reload,
    unsavedDialog,
  } = useSettingsEditor<SocialSettings>("social");

  const platforms = normalizeSocialSettings(draft);

  function updatePlatform(
    key: SocialPlatformKey,
    patch: Partial<SocialPlatformEntry>,
  ) {
    const current = platforms[key];
    setDraft({
      ...platforms,
      [key]: { ...current, ...patch },
    });
  }

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      {SOCIAL_PLATFORM_KEYS.map((key) => {
        const entry = platforms[key];
        return (
          <div
            key={key}
            className="space-y-3 border-b border-border pb-6 last:border-b-0 last:pb-0"
          >
            <p className="text-sm font-medium text-foreground">
              {PLATFORM_ADMIN_LABELS[key]}
            </p>
            <TextField
              label={copy.socialName}
              name={`social-${key}-name`}
              checkScript={false}
              value={getBilingual(entry.name, locale)}
              onChange={(e) =>
                updatePlatform(key, {
                  name: setBilingual(entry.name, locale, e.target.value),
                })
              }
            />
            <TextField
              label={copy.socialUrl}
              name={`social-${key}-url`}
              type="url"
              placeholder="https://"
              checkScript={false}
              value={entry.url ?? ""}
              onChange={(e) => updatePlatform(key, { url: e.target.value })}
            />
          </div>
        );
      })}
    </SettingsFormShell>
  );
}
