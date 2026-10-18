"use client";

import { useEffect, useState } from "react";
import { TextField } from "@/components/forms/TextField";
import { copy } from "@/lib/copy/ar";
import { folderPathLabel } from "@/lib/mediaFolders";

type CreateFolderDialogProps = {
  open: boolean;
  parentPath: string | null;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (name: string) => void;
};

export function CreateFolderDialog({
  open,
  parentPath,
  busy,
  error,
  onCancel,
  onConfirm,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
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
        aria-label={copy.mediaNewFolder}
        className="card-surface w-full max-w-md space-y-4 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-foreground">
          {copy.mediaNewFolder}
        </h2>
        <p className="text-sm text-muted">
          {copy.mediaFolderParent}:{" "}
          <span className="font-semibold text-foreground">
            {parentPath
              ? folderPathLabel(parentPath)
              : copy.mediaFolderRoot}
          </span>
        </p>
        <TextField
          label={copy.mediaFolderName}
          name="folder-name"
          helpText={copy.mediaFolderNameHelp}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
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
            disabled={busy || !name.trim()}
            onClick={() => onConfirm(name.trim())}
          >
            {busy ? copy.saving : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
