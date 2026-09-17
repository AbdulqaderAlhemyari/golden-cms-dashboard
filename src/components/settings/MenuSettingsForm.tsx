"use client";

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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TextField } from "@/components/forms/TextField";
import { SettingsFormShell } from "@/components/settings/SettingsFormShell";
import { useMenuEditor } from "@/hooks/useMenuEditor";
import type { MenuItem, MenuLocation } from "@/lib/api/menus";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

function SortableMenuRow({
  id,
  item,
  labelValue,
  onLabelChange,
}: {
  id: string;
  item: MenuItem;
  labelValue: string;
  onLabelChange: (value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-surface p-3",
        isDragging && "z-10 shadow-md",
      )}
    >
      <button
        type="button"
        className="mt-8 cursor-grab touch-none rounded-md px-2 py-2 text-muted hover:bg-background active:cursor-grabbing"
        aria-label={copy.menuDragHint}
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <TextField
          label={copy.menuLabel}
          name={`menu-label-${id}`}
          value={labelValue}
          onChange={(e) => onLabelChange(e.target.value)}
        />
        <p className="text-xs text-muted" title={copy.menuHrefReadonly}>
          {item.href}
        </p>
      </div>
    </div>
  );
}

function MenuBlock({
  title,
  location,
  items,
  onLabelChange,
  onReorder,
}: {
  title: string;
  location: MenuLocation;
  items: MenuItem[];
  onLabelChange: (index: number, label: string) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const ids = items.map((item, index) => `${location}-${item.href}-${index}`);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(from, to);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="text-xs text-muted">{copy.menuDragHint}</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <SortableMenuRow
                key={ids[index]}
                id={ids[index]!}
                item={item}
                labelValue={item.label}
                onLabelChange={(value) => onLabelChange(index, value)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

export function MenuSettingsForm() {
  const {
    locale,
    draft,
    updateLabel,
    reorder,
    loading,
    error,
    reload,
    unsavedDialog,
  } = useMenuEditor();

  return (
    <SettingsFormShell
      loading={loading}
      error={error}
      onRetry={() => void reload()}
      unsavedDialog={unsavedDialog}
    >
      <MenuBlock
        title={copy.menuMain}
        location="main"
        items={draft.main[locale]}
        onLabelChange={(index, label) => updateLabel("main", index, label)}
        onReorder={(from, to) => reorder("main", from, to)}
      />
      <MenuBlock
        title={copy.menuFooter}
        location="footer"
        items={draft.footer[locale]}
        onLabelChange={(index, label) => updateLabel("footer", index, label)}
        onReorder={(from, to) => reorder("footer", from, to)}
      />
    </SettingsFormShell>
  );
}
