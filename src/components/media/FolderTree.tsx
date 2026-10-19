"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, Folder, FolderOpen } from "lucide-react";
import type { FolderTreeNode } from "@/lib/api/media";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

type FolderTreeProps = {
  tree: FolderTreeNode[];
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
};

function TreeNode({
  node,
  depth,
  selectedPath,
  onSelect,
}: {
  node: FolderTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isSelected = selectedPath === node.path;
  const isAncestor =
    !!selectedPath &&
    selectedPath !== node.path &&
    selectedPath.startsWith(`${node.path}/`);
  const [open, setOpen] = useState(isSelected || isAncestor || depth < 1);

  return (
    <div>
      <div
        className={cn(
          "flex min-h-[var(--touch-min)] items-center gap-1 rounded-lg pe-2 text-sm",
          isSelected
            ? "bg-orange-50 font-semibold text-primary"
            : "text-slate-700 hover:bg-slate-100",
        )}
        style={{ paddingInlineStart: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-200"
            aria-label={open ? "طي" : "توسيع"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            )}
          </button>
        ) : (
          <span className="inline-block w-6" />
        )}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-start"
          onClick={() => onSelect(node.path)}
        >
          {isSelected || isAncestor ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-slate-400" />
          )}
          <span className="truncate" dir="ltr">
            {node.name}
          </span>
        </button>
      </div>
      {hasChildren && open
        ? node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))
        : null}
    </div>
  );
}

export function FolderTree({
  tree,
  selectedPath,
  onSelect,
}: FolderTreeProps) {
  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex min-h-[var(--touch-min)] w-full items-center gap-2 rounded-lg px-2 text-sm",
          selectedPath === null
            ? "bg-orange-50 font-semibold text-primary"
            : "text-slate-700 hover:bg-slate-100",
        )}
      >
        <Folder className="h-4 w-4 shrink-0" />
        <span>{copy.mediaAllFolders}</span>
      </button>
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
