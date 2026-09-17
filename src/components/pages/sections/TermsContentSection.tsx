"use client";

import { RichTextField } from "@/components/forms/RichTextField";
import { fields } from "@/lib/copy/fields";

export type TermsContentValue = {
  content?: string;
};

type Props = {
  value: TermsContentValue;
  onChange: (value: TermsContentValue) => void;
};

export function TermsContentSection({ value, onChange }: Props) {
  const current = value ?? {};

  return (
    <RichTextField
      label={fields.terms.content}
      value={current.content ?? ""}
      onChange={(content) => onChange({ ...current, content })}
    />
  );
}
