"use client";

import { useState } from "react";
import { MediaPickerModal } from "@/components/media/MediaPickerModal";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import type { MediaRef } from "@/lib/pages/types";

type ImageFieldProps = {
  label: string;
  helpText?: string;
  value: MediaRef | undefined;
  onChange: (value: MediaRef) => void;
};

function mediaId(value: MediaRef | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id ?? "";
}

function mediaUrl(value: MediaRef | undefined): string | undefined {
  if (!value || typeof value === "string") return undefined;
  return value.url;
}

export function ImageField({
  label,
  helpText,
  value,
  onChange,
}: ImageFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const id = mediaId(value);
  const url = mediaUrl(value);

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-28 w-44 rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="flex h-28 w-44 items-center justify-center rounded-lg border border-dashed border-border bg-background px-2 text-center text-xs text-muted">
          {id || fields.noImageYet}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setPickerOpen(true)}
        >
          {id ? copy.changePhoto : copy.chooseFromLibrary}
        </button>
        {id ? (
          <button
            type="button"
            className="btn-ghost text-danger"
            onClick={() => onChange(null)}
          >
            {copy.removePhoto}
          </button>
        ) : null}
      </div>
      {helpText ? (
        <p className="text-xs leading-relaxed text-muted">{helpText}</p>
      ) : null}

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media) =>
          onChange({ id: media.id, url: media.url })
        }
      />
    </div>
  );
}
