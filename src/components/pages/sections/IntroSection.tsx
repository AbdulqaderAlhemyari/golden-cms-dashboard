"use client";

import { TextArea } from "@/components/forms/TextArea";
import { fields } from "@/lib/copy/fields";

export type IntroSectionValue = {
  intro?: string;
};

type Props = {
  value: IntroSectionValue;
  onChange: (value: IntroSectionValue) => void;
  label?: string;
  helpText?: string;
};

export function IntroSection({
  value,
  onChange,
  label = fields.projectsIntro.intro,
  helpText,
}: Props) {
  const current = value ?? {};

  return (
    <TextArea
      label={label}
      name="page-intro"
      helpText={helpText}
      rows={5}
      value={current.intro ?? ""}
      onChange={(e) => onChange({ ...current, intro: e.target.value })}
    />
  );
}
