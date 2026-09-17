"use client";

import { TextArea } from "@/components/forms/TextArea";
import { fields } from "@/lib/copy/fields";
import { copy } from "@/lib/copy/ar";

type RichTextFieldProps = {
  label?: string;
  helpText?: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
};

/** Plain rich-text stand-in (TipTap lands with projects Phase 7). */
export function RichTextField({
  label = copy.richText,
  helpText = fields.richTextHelp,
  value,
  onChange,
  name = "rich-text",
}: RichTextFieldProps) {
  return (
    <TextArea
      label={label}
      name={name}
      helpText={helpText}
      rows={10}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
