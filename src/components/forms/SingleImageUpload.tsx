"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/api/media";
import type { MediaRef } from "@/lib/pages/types";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import { mapApiError } from "@/lib/errors/mapApiError";

type SingleImageUploadProps = {
  label: string;
  helpText?: string;
  value: MediaRef | undefined;
  onChange: (value: MediaRef) => void;
  folder?: string;
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

export function SingleImageUpload({
  label,
  helpText,
  value,
  onChange,
  folder = "services",
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const id = mediaId(value);
  const url = mediaUrl(value);

  async function onFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, folder);
      onChange({ id: media.id, url: media.url });
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setUploading(false);
    }
  }

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
        <label className="btn-secondary cursor-pointer">
          {uploading
            ? copy.uploadingPhoto
            : id
              ? copy.changePhoto
              : copy.addPhoto}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              void onFile(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
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
    </div>
  );
}
