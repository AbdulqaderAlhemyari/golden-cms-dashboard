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
  onSelect: (media: MediaItem) => void;
  /** Preferred folder for browsing + uploads (e.g. services/slug/card). */
  folder?: string;
};

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  folder: initialFolder,
}: MediaPickerModalProps) {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState<string | null>(initialFolder ?? null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFolderError, setCreateFolderError] = useState<string | null>(
    null,
  );
  const [createFolderBusy, setCreateFolderBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFolder(initialFolder ?? null);
    setSearch("");
    setDebounced("");
    setPage(1);
    setItems([]);
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

  const uploadFolder = folder?.trim() || initialFolder?.trim() || "library";
  const totalPages = query.data?.totalPages ?? 1;

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

  async function onUpload(input: {
    file: File;
    title: string;
    altAr: string;
    altEn: string;
  }) {
    setUploading(true);
    setUploadError(null);
    try {
      const media = await uploadMedia(input.file, {
        folder: uploadFolder,
        title: input.title,
        altAr: input.altAr || undefined,
        altEn: input.altEn || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      await queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      onSelect(media);
      onClose();
    } catch (err) {
      setUploadError(mapApiError(err));
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

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
          aria-label={copy.chooseFromLibrary}
          className="card-surface flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="font-bold text-foreground">
                {copy.chooseFromLibrary}
              </p>
              <p className="truncate text-xs text-muted">
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
            <aside className="max-h-48 shrink-0 overflow-y-auto border-b border-border p-3 md:max-h-none md:w-56 md:border-b-0 md:border-e">
              <div className="mb-2 flex items-center justify-between gap-2">
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
              {foldersQuery.isLoading ? (
                <p className="text-sm text-muted">{copy.loading}</p>
              ) : (
                <FolderTree
                  tree={foldersQuery.data?.tree ?? []}
                  selectedPath={folder}
                  onSelect={setFolder}
                />
              )}
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap gap-3 border-b border-border px-4 py-3">
                <input
                  className="field-input max-w-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={copy.searchMedia}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setUploadError(null);
                    setUploadOpen(true);
                  }}
                >
                  {copy.uploadNewPhoto}
                </button>
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
                      {items.map((item) => (
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
                            loading="lazy"
                          />
                          <p className="truncate px-2 py-1 text-[11px] text-muted">
                            {mediaDisplayName(item)}
                          </p>
                        </button>
                      ))}
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
        onCancel={() => setUploadOpen(false)}
        onConfirm={(input) => void onUpload(input)}
      />
    </>
  );
}
