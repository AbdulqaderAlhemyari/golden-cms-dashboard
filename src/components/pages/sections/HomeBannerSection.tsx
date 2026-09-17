"use client";

import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";
import type { MediaRef } from "@/lib/pages/types";

export type BannerButton = { label: string; href: string };

export type BannerSectionValue = {
  title?: string;
  subtitle?: string;
  image?: MediaRef;
  buttons?: BannerButton[];
};

type Props = {
  value: BannerSectionValue;
  onChange: (value: BannerSectionValue) => void;
};

function mediaToInput(image: MediaRef | undefined): string {
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.id ?? "";
}

export function HomeBannerSection({ value, onChange }: Props) {
  const current = value ?? {};
  const buttons = current.buttons ?? [
    { label: "", href: "" },
    { label: "", href: "" },
  ];
  const button1 = buttons[0] ?? { label: "", href: "" };
  const button2 = buttons[1] ?? { label: "", href: "" };

  function setButton(index: 0 | 1, patch: Partial<BannerButton>) {
    const next = [...buttons];
    while (next.length < 2) next.push({ label: "", href: "" });
    next[index] = { ...next[index], ...patch };
    onChange({ ...current, buttons: next });
  }

  return (
    <div className="space-y-5">
      <TextField
        label={fields.banner.title}
        name="banner-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />
      <TextArea
        label={fields.banner.subtitle}
        name="banner-subtitle"
        value={current.subtitle ?? ""}
        onChange={(e) => onChange({ ...current, subtitle: e.target.value })}
      />
      <TextField
        label={fields.banner.image}
        name="banner-image"
        helpText={fields.banner.imageHelp}
        placeholder={fields.mediaIdPlaceholder}
        value={mediaToInput(current.image)}
        onChange={(e) =>
          onChange({
            ...current,
            image: e.target.value.trim() ? e.target.value.trim() : null,
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fields.banner.button1Label}
          name="banner-btn1-label"
          value={button1.label}
          onChange={(e) => setButton(0, { label: e.target.value })}
        />
        <TextField
          label={fields.banner.button1Href}
          name="banner-btn1-href"
          value={button1.href}
          onChange={(e) => setButton(0, { href: e.target.value })}
        />
        <TextField
          label={fields.banner.button2Label}
          name="banner-btn2-label"
          value={button2.label}
          onChange={(e) => setButton(1, { label: e.target.value })}
        />
        <TextField
          label={fields.banner.button2Href}
          name="banner-btn2-href"
          value={button2.href}
          onChange={(e) => setButton(1, { href: e.target.value })}
        />
      </div>
    </div>
  );
}
