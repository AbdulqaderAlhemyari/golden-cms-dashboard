"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateFolderDialog } from "@/components/media/CreateFolderDialog";
import { FolderTree } from "@/components/media/FolderTree";
import { UploadMediaModal } from "@/components/media/UploadMediaModal";
import {
  createMediaFolder,
  listMedia,
  listMediaFolders,
  mediaDisplayName,
  uploadMedia,
  type MediaItem,
} from "@/lib/api/media";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { folderPathLabel } from "@/lib/mediaFolders";
import { mapApiError } from "@/lib/errors/mapApiError";

type MediaPickerModalProps = {
  open: boolean;
  onClose: () => void;
  /** Single-select: called when one item is chosen (default mode). */
  onSelect: (media: MediaItem) => void;
  /** Multi-select: called when the user confirms one or more selections. */
  onSelectMany?: (media: MediaItem[]) => void;
  /** Prefer this for multi-upload (avoids React state races). */
  onUploaded?: (media: MediaItem[]) => void;
  /** Preferred folder for browsing + uploads (e.g. services/slug/card). */
  folder?: string;
  /** Allow selecting several images before confirming. */
  multiple?: boolean;
};

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  onSelectMany,
  onUploaded,
  folder: initialFolder,
  multiple = false,
}: MediaPickerModalProps) {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState<string | null>(initialFolder ?? null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedById, setSelectedById] = useState<Record<string, MediaItem>>(
    {},
  );
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFolderError, setCreateFolderError] = useState<string | null>(
    null,
  );
  const [createFolderBusy, setCreateFolderBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFolder(initialFolder ?? null);
    setSearch("");
    setDebounced("");
    setPage(1);
    setItems([]);
    setSelectedById({});
    setError(null);
  }, [open, initialFolder]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [folder]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const foldersQuery = useQuery({
    queryKey: ["media-folders"],
    queryFn: listMediaFolders,
    enabled: open,
  });

  const query = useQuery({
    queryKey: ["media-picker", folder, page, debounced],
    queryFn: () =>
      listMedia({
        page,
        perPage: 24,
        folder: folder ?? undefined,
        exact: folder !== null,
        q: debounced || undefined,
      }),
    enabled: open,
  });

  useEffect(() => {
    if (!query.data) return;
    setItems((prev) =>
      page === 1 ? query.data.items : [...prev, ...query.data.items],
    );
  }, [query.data, page]);

  const selectedItems = Object.values(selectedById);
  const selectedCount = selectedItems.length;

  const uploadFolder = folder?.trim() || initialFolder?.trim() || "library";
  const totalPages = query.data?.totalPages ?? 1;

  function toggleSelect(item: MediaItem) {
    setSelectedById((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return { ...prev, [item.id]: item };
    });
  }

  function confirmSelection() {
    if (selectedCount === 0) return;
    if (onSelectMany) {
      onSelectMany(selectedItems);
    } else {
      for (const item of selectedItems) onSelect(item);
    }
    onClose();
  }

  async function onCreateFolder(name: string) {
    setCreateFolderBusy(true);
    setCreateFolderError(null);
    try {
      const result = await createMediaFolder({
        name,
        parent: folder ?? undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      setFolder(result.folder);
      setCreateFolderOpen(false);
    } catch (err) {
      setCreateFolderError(mapApiError(err));
    } finally {
      setCreateFolderBusy(false);
    }
  }

  async function onUpload(
    batch: Array<{
      file: File;
      title: string;
      altAr: string;
      altEn: string;
    }>,
  ) {
    setUploading(true);
    setUploadError(null);
    setUploadProgress(null);
    try {
      const uploaded: MediaItem[] = [];
      for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        setUploadProgress(
          copy.mediaUploadProgress
            .replace("{done}", String(i + 1))
            .replace("{total}", String(batch.length)),
        );
        uploaded.push(
          await uploadMedia(item.file, {
            folder: uploadFolder,
            title: item.title,
            altAr: item.altAr || undefined,
            altEn: item.altEn || undefined,
          }),
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      await queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      if (onUploaded) {
        onUploaded(uploaded);
      } else if (multiple && onSelectMany) {
        onSelectMany(uploaded);
      } else if (uploaded.length > 0) {
        onSelect(uploaded[uploaded.length - 1]!);
      }
      onClose();
    } catch (err) {
      setUploadError(mapApiError(err));
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }

  if (!open) return null;

  const confirmLabel =
    selectedCount > 1
      ? copy.addSelectedPhotosWithCount.replace(
          "{count}",
          String(selectedCount),
        )
      : copy.addSelectedPhotos;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        role="presentation"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={copy.addPhoto}
          className="card-surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="font-bold text-foreground">{copy.addPhoto}</p>
              <p className="text-xs text-muted">
                {multiple
                  ? copy.addPhotoPickerMultiHint
                  : copy.addPhotoPickerHint}
              </p>
              <p
                className="mt-1 truncate text-xs font-medium text-foreground"
                dir={folder ? "ltr" : undefined}
              >
                {folder
                  ? folderPathLabel(folder)
                  : copy.mediaAllFolders}
              </p>
            </div>
            <button type="button" className="btn-ghost" onClick={onClose}>
              {copy.close}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <aside className="flex max-h-48 shrink-0 flex-col border-b border-border md:max-h-none md:w-56 md:border-b-0 md:border-e">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
                <p className="text-xs font-semibold text-muted">
                  {copy.mediaFolders}
                </p>
                <button
                  type="button"
                  className="btn-ghost px-2 text-xs"
                  onClick={() => {
                    setCreateFolderError(null);
                    setCreateFolderOpen(true);
                  }}
                >
                  {copy.mediaNewFolder}
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {foldersQuery.isLoading ? (
                  <p className="text-sm text-muted">{copy.loading}</p>
                ) : (
                  <FolderTree
                    tree={foldersQuery.data?.tree ?? []}
                    selectedPath={folder}
                    onSelect={setFolder}
                  />
                )}
              </div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setUploadError(null);
                    setUploadOpen(true);
                  }}
                >
                  {copy.uploadNewPhoto}
                </button>
                <input
                  className="field-input max-w-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={copy.searchMedia}
                />
                <p className="text-xs text-muted">
                  {copy.chooseFromLibrary}
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {error ? (
                  <p className="mb-3 text-sm text-danger">{error}</p>
                ) : null}
                {query.isLoading && page === 1 ? (
                  <p className="text-muted">{copy.loading}</p>
                ) : query.isError ? (
                  <p className="text-danger">{mapApiError(query.error)}</p>
                ) : items.length === 0 ? (
                  <p className="text-muted">{copy.noMediaYet}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {items.map((item) => {
                        const isSelected = Boolean(selectedById[item.id]);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={multiple ? isSelected : undefined}
                            className={cn(
                              "relative overflow-hidden rounded-lg border text-start transition-colors",
                              isSelected
                                ? "border-primary ring-2 ring-primary/25"
                                : "border-border hover:border-primary",
                            )}
                            onClick={() => {
                              if (multiple) {
                                toggleSelect(item);
                                return;
                              }
                              onSelect(item);
                              onClose();
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt=""
                              className="aspect-square w-full object-cover"
                              loading="lazy"
                            />
                            {multiple ? (
                              <span
                                className={cn(
                                  "absolute start-2 top-2 flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold",
                                  isSelected
                                    ? "border-primary bg-primary text-white"
                                    : "border-white/80 bg-white/90 text-transparent",
                                )}
                                aria-hidden
                              >
                                ✓
                              </span>
                            ) : null}
                            <p className="truncate px-2 py-1 text-[11px] text-muted">
                              {mediaDisplayName(item)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    {page < totalPages ? (
                      <button
                        type="button"
                        className="btn-secondary mt-4"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={query.isFetching}
                      >
                        {copy.loadMore}
                      </button>
                    ) : null}
                  </>
                )}
              </div>

              {multiple ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                  <p className="text-sm text-muted">
                    {copy.selectedPhotosCount.replace(
                      "{count}",
                      String(selectedCount),
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={onClose}
                    >
                      {copy.cancel}
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={selectedCount === 0}
                      onClick={confirmSelection}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <CreateFolderDialog
        open={createFolderOpen}
        parentPath={folder}
        busy={createFolderBusy}
        error={createFolderError}
        onCancel={() => setCreateFolderOpen(false)}
        onConfirm={(name) => void onCreateFolder(name)}
      />

      <UploadMediaModal
        open={uploadOpen}
        folder={uploadFolder}
        busy={uploading}
        error={uploadError}
        progressLabel={uploadProgress}
        onCancel={() => {
          if (!uploading) setUploadOpen(false);
        }}
        onConfirm={(batch) => void onUpload(batch)}
      />
    </>
  );
}
