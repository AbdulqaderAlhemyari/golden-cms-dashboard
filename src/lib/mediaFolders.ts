import type { FolderTreeNode } from "@/lib/api/media";

const ROOT_LABELS: Record<string, string> = {
  branding: "الهوية والشعار",
  pages: "الصفحات",
  projects: "المشاريع",
  services: "الخدمات",
  misc: "متفرقات",
  library: "المكتبة العامة",
  "seed-import": "استيراد أولي",
  home: "الرئيسية",
  about: "من نحن",
  contact: "اتصل بنا",
  gallery: "معرض",
  card: "بطاقة",
  banner: "بانر",
};

export function folderSegmentLabel(name: string): string {
  return ROOT_LABELS[name] ?? name;
}

export function folderPathLabel(path: string): string {
  if (!path) return "";
  return path
    .split("/")
    .filter(Boolean)
    .map(folderSegmentLabel)
    .join(" / ");
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
