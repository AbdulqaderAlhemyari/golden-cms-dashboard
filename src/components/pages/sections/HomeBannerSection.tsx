"use client";

import { ImageField } from "@/components/forms/ImageField";
import { PageLinkSelect } from "@/components/forms/PageLinkSelect";
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
      <ImageField
        label={fields.banner.image}
        helpText={fields.banner.imageHelp}
        value={current.image}
        onChange={(image) => onChange({ ...current, image })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={fields.banner.button1Label}
          name="banner-btn1-label"
          value={button1.label}
          onChange={(e) => setButton(0, { label: e.target.value })}
        />
        <PageLinkSelect
          label={fields.banner.button1Href}
          value={button1.href}
          onChange={(href) => setButton(0, { href })}
        />
        <TextField
          label={fields.banner.button2Label}
          name="banner-btn2-label"
          value={button2.label}
          onChange={(e) => setButton(1, { label: e.target.value })}
        />
        <PageLinkSelect
          label={fields.banner.button2Href}
          value={button2.href}
          onChange={(href) => setButton(1, { href })}
        />
      </div>
    </div>
  );
}
