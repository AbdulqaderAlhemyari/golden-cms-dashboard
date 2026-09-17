"use client";

import { IconPicker } from "@/components/forms/IconPicker";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";
import { copy } from "@/lib/copy/ar";

export type FeatureItem = {
  icon?: string;
  title: string;
  content: string;
};

export type FeaturesSectionValue = {
  sub_title?: string;
  title?: string;
  description?: string;
  list?: FeatureItem[];
};

type Props = {
  value: FeaturesSectionValue;
  onChange: (value: FeaturesSectionValue) => void;
};

export function HomeFeaturesSection({ value, onChange }: Props) {
  const current = value ?? {};
  const list = current.list ?? [];

  function updateItem(index: number, patch: Partial<FeatureItem>) {
    const next = list.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange({ ...current, list: next });
  }

  function addItem() {
    onChange({
      ...current,
      list: [...list, { title: "", content: "", icon: "" }],
    });
  }

  function removeItem(index: number) {
    onChange({
      ...current,
      list: list.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-5">
      <TextField
        label={fields.features.subTitle}
        name="features-sub"
        value={current.sub_title ?? ""}
        onChange={(e) => onChange({ ...current, sub_title: e.target.value })}
      />
      <TextField
        label={fields.features.title}
        name="features-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />
      <TextArea
        label={fields.features.description}
        name="features-description"
        value={current.description ?? ""}
        onChange={(e) => onChange({ ...current, description: e.target.value })}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          {fields.features.listTitle}
        </p>
        {list.map((item, index) => (
          <div key={index} className="card-surface space-y-3 p-4">
            <TextField
              label={fields.features.itemTitle}
              name={`feature-title-${index}`}
              value={item.title}
              onChange={(e) => updateItem(index, { title: e.target.value })}
            />
            <TextArea
              label={fields.features.itemContent}
              name={`feature-content-${index}`}
              value={item.content}
              onChange={(e) => updateItem(index, { content: e.target.value })}
            />
            <IconPicker
              value={item.icon}
              onChange={(icon) => updateItem(index, { icon })}
            />
            <button
              type="button"
              className="btn-ghost text-danger"
              onClick={() => removeItem(index)}
            >
              {copy.delete}
            </button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={addItem}>
          {fields.features.addItem}
        </button>
      </div>
    </div>
  );
}
