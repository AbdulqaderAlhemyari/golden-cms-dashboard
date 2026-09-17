"use client";

import { Switch } from "@/components/forms/Switch";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";

export type BusinessHoursValue = {
  enable?: boolean;
  title?: string;
  hours?: string;
};

type Props = {
  value: BusinessHoursValue;
  onChange: (value: BusinessHoursValue) => void;
};

export function BusinessHoursSection({ value, onChange }: Props) {
  const current = value ?? {};

  return (
    <div className="space-y-5">
      <Switch
        label={fields.businessHours.enable}
        checked={Boolean(current.enable)}
        onChange={(enable) => onChange({ ...current, enable })}
      />
      <TextField
        label={fields.businessHours.title}
        name="hours-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />
      <TextArea
        label={fields.businessHours.hours}
        name="hours-text"
        value={current.hours ?? ""}
        onChange={(e) => onChange({ ...current, hours: e.target.value })}
      />
    </div>
  );
}
