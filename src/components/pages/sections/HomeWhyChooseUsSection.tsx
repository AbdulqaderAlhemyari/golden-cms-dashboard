"use client";

import { TextField } from "@/components/forms/TextField";
import { fields } from "@/lib/copy/fields";
import { copy } from "@/lib/copy/ar";

export type WhyChooseUsValue = {
  sub_title?: string;
  title?: string;
  list?: string[];
};

type Props = {
  value: WhyChooseUsValue;
  onChange: (value: WhyChooseUsValue) => void;
};

export function HomeWhyChooseUsSection({ value, onChange }: Props) {
  const current = value ?? {};
  const list = current.list ?? [];

  function updateLine(index: number, text: string) {
    const next = list.map((line, i) => (i === index ? text : line));
    onChange({ ...current, list: next });
  }

  function addLine() {
    onChange({ ...current, list: [...list, ""] });
  }

  function removeLine(index: number) {
    onChange({ ...current, list: list.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-5">
      <TextField
        label={fields.whyChooseUs.subTitle}
        name="why-sub"
        value={current.sub_title ?? ""}
        onChange={(e) => onChange({ ...current, sub_title: e.target.value })}
      />
      <TextField
        label={fields.whyChooseUs.title}
        name="why-title"
        value={current.title ?? ""}
        onChange={(e) => onChange({ ...current, title: e.target.value })}
      />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">
          {fields.whyChooseUs.listTitle}
        </p>
        {list.map((line, index) => (
          <div key={index} className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <TextField
                label={`${fields.whyChooseUs.line} ${index + 1}`}
                name={`why-line-${index}`}
                value={line}
                onChange={(e) => updateLine(index, e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-ghost text-danger"
              onClick={() => removeLine(index)}
            >
              {copy.delete}
            </button>
          </div>
        ))}
        <button type="button" className="btn-secondary" onClick={addLine}>
          {fields.whyChooseUs.addLine}
        </button>
      </div>
    </div>
  );
}
