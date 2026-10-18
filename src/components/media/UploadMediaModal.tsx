"use client";

import { useEffect, useState } from "react";
import { TextField } from "@/components/forms/TextField";
import { TextArea } from "@/components/forms/TextArea";
import { copy } from "@/lib/copy/ar";
import { folderPathLabel } from "@/lib/mediaFolders";

type UploadMediaModalProps = {
  open: boolean;
  folder: string;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (input: {
    file: File;
    title: string;
    altAr: string;
    altEn: string;
  }) => void;
};

export function UploadMediaModal({
  open,
  folder,
  busy,
  error,
  onCancel,
  onConfirm,
}: UploadMediaModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [altAr, setAltAr] = useState("");
  const [altEn, setAltEn] = useState("");

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setTitle("");
    setAltAr("");
    setAltEn("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.mediaUploadTitle}
        className="card-surface w-full max-w-lg space-y-4 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-foreground">
          {copy.mediaUploadTitle}
        </h2>
        <p className="text-sm text-muted">
          {copy.mediaCurrentFolder}:{" "}
          <span className="font-semibold text-foreground">
            {folderPathLabel(folder)}
          </span>
        </p>

        <div className="space-y-2">
          <p className="text-sm font-semibold">{copy.addPhoto}</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="field-input w-full"
            disabled={busy}
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              if (next && !title.trim()) {
                setTitle(next.name.replace(/\.[^.]+$/, ""));
              }
            }}
          />
        </div>

        <TextField
          label={copy.mediaImageTitle}
          name="media-title"
          helpText={copy.mediaImageTitleHelp}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextArea
          label={`${copy.mediaImageAlt} (AR)`}
          name="alt-ar"
          rows={2}
          value={altAr}
          onChange={(e) => setAltAr(e.target.value)}
        />
        <TextArea
          label={`${copy.mediaImageAlt} (EN)`}
          name="alt-en"
          rows={2}
          value={altEn}
          onChange={(e) => setAltEn(e.target.value)}
        />

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={busy || !file}
            onClick={() => {
              if (!file) return;
              onConfirm({
                file,
                title: title.trim() || file.name,
                altAr: altAr.trim(),
                altEn: altEn.trim(),
              });
            }}
          >
            {busy ? copy.uploadingPhoto : copy.uploadNewPhoto}
          </button>
        </div>
      </div>
    </div>
  );
}
