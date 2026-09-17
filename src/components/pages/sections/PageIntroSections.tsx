"use client";

import { IntroSection, type IntroSectionValue } from "@/components/pages/sections/IntroSection";
import { fields } from "@/lib/copy/fields";

type Props = {
  value: IntroSectionValue;
  onChange: (value: IntroSectionValue) => void;
};

export function ProjectsIntroSection({ value, onChange }: Props) {
  return (
    <IntroSection
      value={value}
      onChange={onChange}
      label={fields.projectsIntro.intro}
      helpText={fields.projectsIntro.introHelp}
    />
  );
}

export function ContactIntroSection({ value, onChange }: Props) {
  return (
    <IntroSection
      value={value}
      onChange={onChange}
      label={fields.contactIntro.intro}
    />
  );
}
