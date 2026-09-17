"use client";

import { ImageField } from "@/components/forms/ImageField";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { Switch } from "@/components/forms/Switch";
import { fields } from "@/lib/copy/fields";
import type { MediaRef } from "@/lib/pages/types";

export type SeoSectionValue = {
  title?: string | null;
  meta_title?: string | null;
  description?: string | null;
  image?: MediaRef;
  draft?: boolean;
};

type SeoSectionProps = {
  value: SeoSectionValue;
  onChange: (value: SeoSectionValue) => void;
};

export function SeoSection({ value, onChange }: SeoSectionProps) {
  const current = value ?? {};

  return (
    <div className="space-y-5">
      <TextField
        label={fields.seo.title}
        name="seo-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />
      <TextField
        label={fields.seo.metaTitle}
        name="seo-meta-title"
        helpText={fields.seo.metaTitleHelp}
        value={current.meta_title ?? ""}
        onChange={(e) => onChange({ ...current, meta_title: e.target.value })}
      />
      <TextArea
        label={fields.seo.description}
        name="seo-description"
        helpText={fields.seo.descriptionHelp}
        value={current.description ?? ""}
        onChange={(e) => onChange({ ...current, description: e.target.value })}
      />
      <ImageField
        label={fields.seo.image}
        helpText={fields.seo.imageHelp}
        value={current.image}
        onChange={(image) => onChange({ ...current, image })}
      />
      <Switch
        label={fields.seo.draft}
        checked={Boolean(current.draft)}
        onChange={(checked) => onChange({ ...current, draft: checked })}
      />
    </div>
  );
}
