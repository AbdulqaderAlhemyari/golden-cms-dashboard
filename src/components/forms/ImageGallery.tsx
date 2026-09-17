"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { TextField } from "@/components/forms/TextField";
import { uploadMedia, updateMediaAlt } from "@/lib/api/media";
import type { MediaRefObject } from "@/lib/api/projects";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import { mapApiError } from "@/lib/errors/mapApiError";

export type GalleryItem = MediaRefObject & {
  altAr?: string | null;
  altEn?: string | null;
};

type ImageGalleryProps = {
  items: GalleryItem[];
  coverId: string | null;
  onChange: (items: GalleryItem[]) => void;
  onCoverChange: (id: string | null) => void;
  uploadFolder?: string;
};

function SortableThumb({
  item,
  isCover,
  selected,
  onSelect,
  onSetCover,
  onRemove,
}: {
  item: GalleryItem;
  isCover: boolean;
  selected: boolean;
  onSelect: () => void;
  onSetCover: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative overflow-hidden rounded-lg border bg-surface",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border",
      )}
    >
      <button
        type="button"
        className="block w-full"
        onClick={onSelect}
        {...attributes}
        {...listeners}
      >
        {item.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt=""
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-slate-100 px-2 text-center text-xs text-muted">
            {item.id}
          </div>
        )}
      </button>
      {isCover ? (
        <span className="absolute start-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
          {copy.mainPhoto}
        </span>
      ) : null}
      <div className="flex gap-1 p-2">
        {!isCover ? (
          <button
            type="button"
            className="btn-ghost flex-1 px-1 py-1 text-[11px]"
            onClick={onSetCover}
          >
            {fields.setMainPhoto}
          </button>
        ) : null}
        <button
          type="button"
          className="btn-ghost px-2 py-1 text-[11px] text-danger"
          onClick={onRemove}
        >
          {copy.delete}
        </button>
      </div>
    </div>
  );
}

export function ImageGallery({
  items,
  coverId,
  onChange,
  onCoverChange,
  uploadFolder = "projects",
}: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: GalleryItem[] = [];
      for (const file of Array.from(files)) {
        const media = await uploadMedia(file, uploadFolder);
        uploaded.push({
          id: media.id,
          url: media.url,
          altAr: media.altAr,
          altEn: media.altEn,
        });
      }
      const next = [...items, ...uploaded];
      onChange(next);
      if (!coverId && next[0]) onCoverChange(next[0].id);
      setSelectedId(uploaded[0]?.id ?? selectedId);
    } catch (error) {
      toast.error(mapApiError(error));
    } finally {
      setUploading(false);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  }

  async function saveAlt(patch: { altAr?: string; altEn?: string }) {
    if (!selected) return;
    try {
      await updateMediaAlt(selected.id, patch);
      onChange(
        items.map((item) =>
          item.id === selected.id ? { ...item, ...patch } : item,
        ),
      );
      toast.success(copy.saved);
    } catch (error) {
      toast.error(mapApiError(error));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
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
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted">{fields.galleryEmpty}</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => (
                  <SortableThumb
                    key={item.id}
                    item={item}
                    isCover={coverId === item.id}
                    selected={selectedId === item.id}
                    onSelect={() => setSelectedId(item.id)}
                    onSetCover={() => onCoverChange(item.id)}
                    onRemove={() => {
                      const next = items.filter((i) => i.id !== item.id);
                      onChange(next);
                      if (coverId === item.id) {
                        onCoverChange(next[0]?.id ?? null);
                      }
                      if (selectedId === item.id) setSelectedId(null);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <aside className="card-surface h-fit space-y-4 p-4">
        <p className="text-sm font-semibold">{fields.photoAltPanel}</p>
        {selected ? (
          <>
            {selected.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.url}
                alt=""
                className="h-36 w-full rounded-lg object-cover"
              />
            ) : null}
            <TextField
              label={`${copy.photoAlt} (العربية)`}
              name="alt-ar"
              value={selected.altAr ?? ""}
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === selected.id ? { ...i, altAr: e.target.value } : i,
                  ),
                )
              }
              onBlur={(e) => void saveAlt({ altAr: e.target.value })}
            />
            <TextField
              label={`${copy.photoAlt} (English)`}
              name="alt-en"
              value={selected.altEn ?? ""}
              onChange={(e) =>
                onChange(
                  items.map((i) =>
                    i.id === selected.id ? { ...i, altEn: e.target.value } : i,
                  ),
                )
              }
              onBlur={(e) => void saveAlt({ altEn: e.target.value })}
            />
          </>
        ) : (
          <p className="text-sm text-muted">{copy.emptyDefault}</p>
        )}
      </aside>
    </div>
  );
}
