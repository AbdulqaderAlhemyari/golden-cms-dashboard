"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import { UpdateWebsiteButton } from "@/components/shell/UpdateWebsiteButton";
import { copy } from "@/lib/copy/ar";
import { getPageTitle, isEditorRoute } from "@/lib/nav";

export function TopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const showEditorControls = isEditorRoute(pathname);
  const [locale, setLocale] = useState<ContentLocale>("ar");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    toast.success(copy.saved);
  }

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/95 px-6 py-4 backdrop-blur md:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold text-foreground md:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <UpdateWebsiteButton variant="compact" />
        {showEditorControls ? (
          <>
            <LanguageTabs value={locale} onChange={setLocale} />
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? copy.saving : copy.save}
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}
