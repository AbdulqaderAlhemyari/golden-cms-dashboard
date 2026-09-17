"use client";

import { useState, type KeyboardEvent } from "react";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";

type TagInputProps = {
  label: string;
  helpText?: string;
  value: string[];
  onChange: (tags: string[]) => void;
};

export function TagInput({ label, helpText, value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const tag = draft.trim();
    if (!tag) return;
    if (value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-primary"
          >
            {tag}
            <button
              type="button"
              className="text-primary/70 hover:text-primary"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={copy.delete}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          className="field-input max-w-xs"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={fields.tagPlaceholder}
        />
        <button type="button" className="btn-secondary" onClick={addTag}>
          {fields.addTag}
        </button>
      </div>
      {helpText ? (
        <p className="text-xs leading-relaxed text-muted">{helpText}</p>
      ) : null}
    </div>
  );
}
