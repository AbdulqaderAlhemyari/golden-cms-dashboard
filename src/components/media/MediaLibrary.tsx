"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TextField } from "@/components/forms/TextField";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import {
  deleteMedia,
  listMedia,
  mediaDisplayName,
  updateMediaAlt,
  uploadMedia,
  type MediaItem,
} from "@/lib/api/media";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

export function MediaLibrary() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altLocale, setAltLocale] = useState<ContentLocale>("ar");
  const [altAr, setAltAr] = useState("");
  const [altEn, setAltEn] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const query = useQuery({
    queryKey: ["media", page, debounced],
    queryFn: () =>
      listMedia({
        page,
        perPage: 24,
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
    setAltAr(selected.altAr ?? "");
    setAltEn(selected.altEn ?? "");
  }, [selected]);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      let last: MediaItem | null = null;
      for (const file of Array.from(files)) {
        last = await uploadMedia(file, "library");
      }
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      setPage(1);
      if (last) setSelected(last);
      toast.success(copy.saved);
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setUploading(false);
    }
  }

  const saveAltMutation = useMutation({
    mutationFn: () =>
      updateMediaAlt(selected!.id, { altAr: altAr || null, altEn: altEn || null }),
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
      <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row md:p-8">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-primary cursor-pointer">
              {uploading ? copy.uploadingPhoto : copy.addPhoto}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  void onUpload(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <input
              className="field-input max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={copy.searchMedia}
              aria-label={copy.searchMedia}
            />
          </div>

          {query.isLoading && page === 1 ? (
            <p className="text-muted">{copy.loading}</p>
          ) : query.isError ? (
            <p className="text-danger">{mapApiError(query.error)}</p>
          ) : items.length === 0 ? (
            <EmptyState
              message={copy.noMediaYet}
              action={
                <label className="btn-primary cursor-pointer">
                  {copy.addPhoto}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      void onUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
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
                      />
                      <p className="truncate px-2 py-1.5 text-xs text-muted">
                        {mediaDisplayName(item)}
                      </p>
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

        <aside className="w-full shrink-0 md:w-80">
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
                <p className="text-sm font-semibold text-foreground">
                  {mediaDisplayName(selected)}
                </p>
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
                  disabled={saveAltMutation.isPending}
                  onClick={() => saveAltMutation.mutate()}
                >
                  {saveAltMutation.isPending ? copy.saving : copy.save}
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
