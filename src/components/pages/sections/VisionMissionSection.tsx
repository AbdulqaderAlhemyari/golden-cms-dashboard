"use client";

import { IconPicker } from "@/components/forms/IconPicker";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";

export type VisionMissionValue = {
  subtitle?: string;
  icon?: string;
  content?: string;
};

type Props = {
  value: VisionMissionValue;
  onChange: (value: VisionMissionValue) => void;
};

export function VisionMissionSection({ value, onChange }: Props) {
  const current = value ?? {};

  return (
    <div className="space-y-5">
      <TextField
        label={fields.visionMission.subtitle}
        name="vm-subtitle"
        value={current.subtitle ?? ""}
        onChange={(e) => onChange({ ...current, subtitle: e.target.value })}
      />
      <IconPicker
        value={current.icon}
        onChange={(icon) => onChange({ ...current, icon })}
      />
      <TextArea
        label={fields.visionMission.content}
        name="vm-content"
        rows={5}
        value={current.content ?? ""}
        onChange={(e) => onChange({ ...current, content: e.target.value })}
      />
    </div>
  );
}
