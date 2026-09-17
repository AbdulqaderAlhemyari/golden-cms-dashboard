"use client";

import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";

export type FeaturedProjectsValue = {
  sub_title?: string;
  title?: string;
  view_all?: string;
};

type Props = {
  value: FeaturedProjectsValue;
  onChange: (value: FeaturedProjectsValue) => void;
};

export function HomeFeaturedProjectsSection({ value, onChange }: Props) {
  const current = value ?? {};

  return (
    <div className="space-y-5">
      <TextField
        label={fields.featuredProjects.subTitle}
        name="fp-sub"
        value={current.sub_title ?? ""}
        onChange={(e) => onChange({ ...current, sub_title: e.target.value })}
      />
      <TextField
        label={fields.featuredProjects.title}
        name="fp-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />
      <TextField
        label={fields.featuredProjects.viewAll}
        name="fp-view-all"
        value={current.view_all ?? ""}
        onChange={(e) => onChange({ ...current, view_all: e.target.value })}
      />
    </div>
  );
}
