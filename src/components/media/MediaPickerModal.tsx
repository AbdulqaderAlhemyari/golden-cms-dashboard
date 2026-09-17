"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listMedia,
  mediaDisplayName,
  uploadMedia,
  type MediaItem,
} from "@/lib/api/media";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type MediaPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
};

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const query = useQuery({
    queryKey: ["media-picker", debounced],
    queryFn: () => listMedia({ page: 1, perPage: 48, q: debounced || undefined }),
    enabled: open,
  });

  async function onUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const media = await uploadMedia(file, "library");
      onSelect(media);
      onClose();
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.chooseFromLibrary}
        className="card-surface flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="font-bold text-foreground">{copy.chooseFromLibrary}</p>
          <button type="button" className="btn-ghost" onClick={onClose}>
            {copy.close}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-border px-4 py-3">
          <input
            className="field-input max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchMedia}
          />
          <label className="btn-secondary cursor-pointer">
            {uploading ? copy.uploadingPhoto : copy.uploadNewPhoto}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                void onUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
          {query.isLoading ? (
            <p className="text-muted">{copy.loading}</p>
          ) : query.isError ? (
            <p className="text-danger">{mapApiError(query.error)}</p>
          ) : (query.data?.items.length ?? 0) === 0 ? (
            <p className="text-muted">{copy.noMediaYet}</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {query.data!.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "overflow-hidden rounded-lg border border-border text-start hover:border-primary",
                  )}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <p className="truncate px-2 py-1 text-[11px] text-muted">
                    {mediaDisplayName(item)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
