/** Client + product limits for media batch uploads. */
export const MEDIA_UPLOAD_MAX_FILES = 10;
export const MEDIA_UPLOAD_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB each
export const MEDIA_UPLOAD_MAX_BATCH_BYTES = 50 * 1024 * 1024; // 50MB total

/** English letters, numbers, and hyphens only. */
export const MEDIA_TITLE_PATTERN = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

export type UploadDraftItem = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
};

export function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1);
}

export function slugifyMediaTitle(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return slug;
}

export function isValidMediaTitle(value: string): boolean {
  return MEDIA_TITLE_PATTERN.test(value.trim());
}

export function validateMediaBatch(files: File[]): string | null {
  if (files.length === 0) return "empty";
  if (files.length > MEDIA_UPLOAD_MAX_FILES) return "tooMany";

  let total = 0;
  for (const file of files) {
    if (file.size > MEDIA_UPLOAD_MAX_FILE_BYTES) return "fileTooLarge";
    total += file.size;
  }
  if (total > MEDIA_UPLOAD_MAX_BATCH_BYTES) return "batchTooLarge";
  return null;
}

export function filesToDraftItems(files: File[]): UploadDraftItem[] {
  return files.map((file, index) => {
    const base = file.name.replace(/\.[^.]+$/, "") || file.name;
    const title = slugifyMediaTitle(base) || `image-${index + 1}`;
    return {
      id: `${file.name}-${file.size}-${index}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
      title,
      description: "",
    };
  });
}

export function revokeDraftPreviews(items: UploadDraftItem[]): void {
  for (const item of items) {
    URL.revokeObjectURL(item.previewUrl);
  }
}
