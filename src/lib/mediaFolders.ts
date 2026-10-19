import type { FolderTreeNode } from "@/lib/api/media";

/** Display folder path exactly as stored (English slugs). */
export function folderPathLabel(path: string): string {
  return path.trim();
}

export function findFolderNode(
  tree: FolderTreeNode[],
  path: string,
): FolderTreeNode | null {
  for (const node of tree) {
    if (node.path === path) return node;
    const nested = findFolderNode(node.children, path);
    if (nested) return nested;
  }
  return null;
}
