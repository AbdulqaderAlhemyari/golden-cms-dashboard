"use client";

import { ImageField } from "@/components/forms/ImageField";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";
import type { MediaRef } from "@/lib/pages/types";

export type AboutUsValue = {
  subtitle?: string;
  title?: string;
  content?: string;
  image?: MediaRef;
};

type Props = {
  value: AboutUsValue;
  onChange: (value: AboutUsValue) => void;
};

export function AboutUsSection({ value, onChange }: Props) {
  const current = value ?? {};

  return (
    <div className="space-y-5">
      <TextField
        label={fields.aboutUs.subtitle}
        name="about-subtitle"
        value={current.subtitle ?? ""}
        onChange={(e) => onChange({ ...current, subtitle: e.target.value })}
      />
      <TextField
        label={fields.aboutUs.title}
        name="about-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />
      <TextArea
        label={fields.aboutUs.content}
        name="about-content"
        rows={6}
        value={current.content ?? ""}
        onChange={(e) => onChange({ ...current, content: e.target.value })}
      />
      <ImageField
        label={fields.aboutUs.image}
        helpText={fields.aboutUs.imageHelp}
        value={current.image}
        onChange={(image) => onChange({ ...current, image })}
      />
    </div>
  );
}
