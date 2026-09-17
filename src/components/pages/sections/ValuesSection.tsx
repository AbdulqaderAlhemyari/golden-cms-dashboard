"use client";

import { IconPicker } from "@/components/forms/IconPicker";
import { TextArea } from "@/components/forms/TextArea";
import { TextField } from "@/components/forms/TextField";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";

export type LabeledItem = {
  icon?: string;
  label: string;
  description?: string;
};

export type ValuesSectionValue = {
  subtitle?: string;
  title?: string;
  list?: LabeledItem[];
};

type Props = {
  value: ValuesSectionValue;
  onChange: (value: ValuesSectionValue) => void;
};

export function ValuesSection({ value, onChange }: Props) {
  const current = value ?? {};
  const list = current.list ?? [];

  function updateItem(index: number, patch: Partial<LabeledItem>) {
    onChange({
      ...current,
      list: list.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  }

  return (
    <div className="space-y-5">
      <TextField
        label={fields.values.subtitle}
        name="values-subtitle"
        value={current.subtitle ?? ""}
        onChange={(e) => onChange({ ...current, subtitle: e.target.value })}
      />
      <TextField
        label={fields.values.title}
        name="values-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold">{fields.values.listTitle}</p>
        {list.map((item, index) => (
          <div key={index} className="card-surface space-y-3 p-4">
            <TextField
              label={fields.values.itemLabel}
              name={`value-label-${index}`}
              value={item.label}
              onChange={(e) => updateItem(index, { label: e.target.value })}
            />
            <TextArea
              label={fields.values.itemDescription}
              name={`value-desc-${index}`}
              value={item.description ?? ""}
              onChange={(e) =>
                updateItem(index, { description: e.target.value })
              }
            />
            <IconPicker
              value={item.icon}
              onChange={(icon) => updateItem(index, { icon })}
            />
            <button
              type="button"
              className="btn-ghost text-danger"
              onClick={() =>
                onChange({
                  ...current,
                  list: list.filter((_, i) => i !== index),
                })
              }
            >
              {copy.delete}
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            onChange({
              ...current,
              list: [...list, { label: "", description: "", icon: "star" }],
            })
          }
        >
          {fields.values.addItem}
        </button>
      </div>
    </div>
  );
}
