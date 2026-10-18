"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TextField } from "@/components/forms/TextField";
import { CreateFolderDialog } from "@/components/media/CreateFolderDialog";
import { FolderTree } from "@/components/media/FolderTree";
import { UploadMediaModal } from "@/components/media/UploadMediaModal";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import {
  createMediaFolder,
  deleteMedia,
  listMedia,
  listMediaFolders,
  mediaDisplayName,
  updateMedia,
  uploadMedia,
  type MediaItem,
} from "@/lib/api/media";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { folderPathLabel } from "@/lib/mediaFolders";
import { mapApiError } from "@/lib/errors/mapApiError";

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [folder, setFolder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altLocale, setAltLocale] = useState<ContentLocale>("ar");
  const [title, setTitle] = useState("");
  const [altAr, setAltAr] = useState("");
  const [altEn, setAltEn] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFolderError, setCreateFolderError] = useState<string | null>(
    null,
  );
  const [createFolderBusy, setCreateFolderBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);

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
    setSelected(null);
  }, [folder]);

  const foldersQuery = useQuery({
    queryKey: ["media-folders"],
    queryFn: listMediaFolders,
  });

  const query = useQuery({
    queryKey: ["media", folder, page, debounced],
    queryFn: () =>
      listMedia({
        page,
        perPage: 24,
        folder: folder ?? undefined,
        exact: folder !== null,
        q: debounced || undefined,
      }),
  });

  useEffect(() => {
    if (!query.data) return;
    setItems((prev) =>
      page === 1 ? query.data.items : [...prev, ...query.data.items],
    );
  }, [query.data, page]);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title ?? mediaDisplayName(selected));
    setAltAr(selected.altAr ?? "");
    setAltEn(selected.altEn ?? "");
  }, [selected]);

  const uploadFolder = folder?.trim() || "library";

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
      toast.success(copy.mediaFolderCreated);
    } catch (error) {
      setCreateFolderError(mapApiError(error));
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
      setPage(1);
      setSelected(media);
      setUploadOpen(false);
      toast.success(copy.saved);
    } catch (error) {
      setUploadError(mapApiError(error));
    } finally {
      setUploading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMedia(selected!.id, {
        title: title.trim() || null,
        altAr: altAr || null,
        altEn: altEn || null,
      }),
    onSuccess: (media) => {
      setSelected(media);
      setItems((prev) => prev.map((m) => (m.id === media.id ? media : m)));
      toast.success(copy.saved);
    },
    onError: (error) => toast.error(mapApiError(error)),
  });

  async function onDelete() {
    if (!selected) return;
    try {
      await deleteMedia(selected.id);
      setItems((prev) => prev.filter((m) => m.id !== selected.id));
      setSelected(null);
      setConfirmDelete(false);
      toast.success(copy.mediaDeleted);
      await queryClient.invalidateQueries({ queryKey: ["media"] });
    } catch (error) {
      toast.error(mapApiError(error));
      setConfirmDelete(false);
    }
  }

  const totalPages = query.data?.totalPages ?? 1;

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-8">
        <aside className="w-full shrink-0 md:w-64 lg:w-72">
          <div className="card-surface sticky top-24 max-h-[70vh] space-y-3 overflow-y-auto p-3">
            <div className="flex items-center justify-between gap-2 px-1">
              <p className="text-sm font-bold text-foreground">
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
              <p className="px-2 text-sm text-muted">{copy.loading}</p>
            ) : foldersQuery.isError ? (
              <p className="px-2 text-sm text-danger">
                {mapApiError(foldersQuery.error)}
              </p>
            ) : (
              <FolderTree
                tree={foldersQuery.data?.tree ?? []}
                selectedPath={folder}
                onSelect={setFolder}
              />
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {folder
                  ? folderPathLabel(folder)
                  : copy.mediaAllFolders}
              </p>
              {folder ? (
                <p className="truncate text-xs text-muted" dir="ltr">
                  {folder}
                </p>
              ) : (
                <p className="text-xs text-muted">{copy.mediaSelectFolderHint}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setUploadError(null);
                  setUploadOpen(true);
                }}
              >
                {copy.addPhoto}
              </button>
              <input
                className="field-input max-w-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchMedia}
                aria-label={copy.searchMedia}
              />
            </div>
          </div>

          {query.isLoading && page === 1 ? (
            <p className="text-muted">{copy.loading}</p>
          ) : query.isError ? (
            <p className="text-danger">{mapApiError(query.error)}</p>
          ) : items.length === 0 ? (
            <EmptyState
              message={copy.noMediaYet}
              action={
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setUploadError(null);
                    setUploadOpen(true);
                  }}
                >
                  {copy.mediaEmptyFolderUpload}
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => {
                  const active = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className={cn(
                        "overflow-hidden rounded-lg border bg-surface text-start transition-colors",
                        active
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-accent",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.altAr || item.altEn || ""}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                      <div className="space-y-0.5 px-2 py-1.5">
                        <p className="truncate text-xs font-medium text-foreground">
                          {mediaDisplayName(item)}
                        </p>
                        {item.folder ? (
                          <p
                            className="truncate text-[10px] text-muted"
                            dir="ltr"
                          >
                            {item.folder}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              {page < totalPages ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={query.isFetching}
                >
                  {copy.loadMore}
                </button>
              ) : null}
            </>
          )}
        </div>

        <aside className="w-full shrink-0 md:w-72 lg:w-80">
          <div className="card-surface sticky top-24 space-y-4 p-4">
            {!selected ? (
              <p className="text-sm text-muted">{copy.emptyDefault}</p>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.url}
                  alt=""
                  className="w-full rounded-lg object-cover"
                />
                <TextField
                  label={copy.mediaImageTitle}
                  name="media-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {selected.folder ? (
                  <p className="text-xs text-muted" dir="ltr">
                    {selected.folder}
                  </p>
                ) : null}
                <LanguageTabs value={altLocale} onChange={setAltLocale} />
                {altLocale === "ar" ? (
                  <TextField
                    label={copy.photoAlt}
                    name="alt-ar"
                    value={altAr}
                    onChange={(e) => setAltAr(e.target.value)}
                  />
                ) : (
                  <TextField
                    label={copy.photoAlt}
                    name="alt-en"
                    value={altEn}
                    onChange={(e) => setAltEn(e.target.value)}
                  />
                )}
                <button
                  type="button"
                  className="btn-primary w-full"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                >
                  {saveMutation.isPending ? copy.saving : copy.save}
                </button>
                <button
                  type="button"
                  className="btn-danger w-full"
                  onClick={() => setConfirmDelete(true)}
                >
                  {copy.delete}
                </button>
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => setSelected(null)}
                >
                  {copy.closePanel}
                </button>
              </>
            )}
          </div>
        </aside>
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

      <ConfirmDialog
        open={confirmDelete}
        title={copy.delete}
        description={copy.confirmDelete}
        confirmLabel={copy.delete}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void onDelete()}
      />
    </>
  );
}
