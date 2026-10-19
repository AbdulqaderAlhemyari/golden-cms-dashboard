"use client";

import { useEffect, useMemo, useState } from "react";
import { TextField } from "@/components/forms/TextField";
import { TextArea } from "@/components/forms/TextArea";
import { copy } from "@/lib/copy/ar";
import { folderPathLabel } from "@/lib/mediaFolders";
import {
  MEDIA_UPLOAD_MAX_FILES,
  filesToDraftItems,
  formatMegabytes,
  isValidMediaTitle,
  revokeDraftPreviews,
  validateMediaBatch,
  type UploadDraftItem,
} from "@/lib/mediaUploadLimits";

export type UploadMediaBatchItem = {
  file: File;
  title: string;
  altAr: string;
  altEn: string;
};

type UploadMediaModalProps = {
  open: boolean;
  folder: string;
  busy?: boolean;
  error?: string | null;
  progressLabel?: string | null;
  onCancel: () => void;
  onConfirm: (items: UploadMediaBatchItem[]) => void;
};

function mapValidationError(code: string | null): string | null {
  if (!code || code === "empty") return null;
  if (code === "tooMany") return copy.mediaUploadTooMany;
  if (code === "fileTooLarge") return copy.mediaUploadFileTooLarge;
  if (code === "batchTooLarge") return copy.mediaUploadBatchTooLarge;
  return null;
}

export function UploadMediaModal({
  open,
  folder,
  busy,
  error,
  progressLabel,
  onCancel,
  onConfirm,
}: UploadMediaModalProps) {
  const [drafts, setDrafts] = useState<UploadDraftItem[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDrafts((prev) => {
      revokeDraftPreviews(prev);
      return [];
    });
    setLocalError(null);
  }, [open]);

  useEffect(() => {
    return () => {
      revokeDraftPreviews(drafts);
    };
    // Only revoke on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel, busy]);

  const totalBytes = useMemo(
    () => drafts.reduce((sum, item) => sum + item.file.size, 0),
    [drafts],
  );

  function applyFiles(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    const code = validateMediaBatch(files);
    if (code === "empty") {
      setDrafts((prev) => {
        revokeDraftPreviews(prev);
        return [];
      });
      setLocalError(null);
      return;
    }
    const message = mapValidationError(code);
    if (message) {
      setLocalError(message);
      return;
    }
    setLocalError(null);
    setDrafts((prev) => {
      revokeDraftPreviews(prev);
      return filesToDraftItems(files);
    });
  }

  function removeDraft(id: string) {
    setDrafts((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((d) => d.id !== id);
      setLocalError(
        mapValidationError(validateMediaBatch(next.map((d) => d.file))),
      );
      return next;
    });
  }

  function updateDraft(
    id: string,
    patch: Partial<Pick<UploadDraftItem, "title" | "description">>,
  ) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  }

  if (!open) return null;

  const displayError = localError || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="presentation"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.mediaUploadTitle}
        className="card-surface flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            {copy.mediaUploadTitle}
          </h2>
          <p className="text-sm text-muted">
            {copy.mediaCurrentFolder}:{" "}
            <span className="font-semibold text-foreground" dir="ltr">
              {folderPathLabel(folder)}
            </span>
          </p>
          <p className="rounded-lg bg-orange-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
            {copy.mediaUploadHint}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">{copy.mediaUploadSelectFiles}</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="field-input w-full"
              disabled={busy}
              onChange={(e) => {
                applyFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="text-xs text-muted">
              {copy.mediaUploadSelectedCount.replace(
                "{count}",
                String(drafts.length),
              )}
              {" · "}
              {copy.mediaUploadBatchSize.replace(
                "{size}",
                formatMegabytes(totalBytes),
              )}
            </p>
          </div>

          {drafts.length > 0 ? (
            <ul className="space-y-3">
              {drafts.map((item) => {
                const titleInvalid =
                  item.title.trim().length > 0 &&
                  !isValidMediaTitle(item.title);
                return (
                  <li
                    key={item.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="min-w-0 truncate text-xs text-muted"
                            dir="ltr"
                          >
                            {item.file.name} ·{" "}
                            {formatMegabytes(item.file.size)} MB
                          </p>
                          <button
                            type="button"
                            className="btn-ghost shrink-0 px-2 text-xs text-danger"
                            disabled={busy}
                            onClick={() => removeDraft(item.id)}
                          >
                            {copy.mediaRemoveFromBatch}
                          </button>
                        </div>
                        <TextField
                          label={copy.mediaImageTitle}
                          name={`title-${item.id}`}
                          helpText={copy.mediaImageTitleHelp}
                          checkScript={false}
                          error={
                            titleInvalid
                              ? copy.mediaImageTitleInvalid
                              : undefined
                          }
                          value={item.title}
                          disabled={busy}
                          dir="ltr"
                          onChange={(e) =>
                            updateDraft(item.id, {
                              title: e.target.value.replace(/\s+/g, "-"),
                            })
                          }
                        />
                        <TextArea
                          label={copy.mediaImageDesc}
                          name={`desc-${item.id}`}
                          helpText={copy.mediaImageDescHelp}
                          checkScript={false}
                          rows={2}
                          value={item.description}
                          disabled={busy}
                          onChange={(e) =>
                            updateDraft(item.id, {
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {progressLabel ? (
            <p className="text-sm font-medium text-primary">{progressLabel}</p>
          ) : null}

          {displayError ? (
            <p className="text-sm text-danger" role="alert">
              {displayError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
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
            disabled={busy || drafts.length === 0}
            onClick={() => {
              const code = validateMediaBatch(drafts.map((d) => d.file));
              if (code) {
                setLocalError(
                  code === "empty"
                    ? copy.mediaUploadEmpty
                    : mapValidationError(code),
                );
                return;
              }
              const invalid = drafts.find(
                (d) => !isValidMediaTitle(d.title.trim()),
              );
              if (invalid) {
                setLocalError(copy.mediaImageTitleInvalid);
                return;
              }
              setLocalError(null);
              onConfirm(
                drafts.map((d) => {
                  const title = d.title.trim();
                  const description = d.description.trim();
                  return {
                    file: d.file,
                    title,
                    altAr: description,
                    altEn: description,
                  };
                }),
              );
            }}
          >
            {busy
              ? copy.uploadingPhoto
              : drafts.length > 1
                ? copy.mediaUploadTitle
                : copy.uploadNewPhoto}
          </button>
        </div>
      </div>
    </div>
  );
}

export { MEDIA_UPLOAD_MAX_FILES };
