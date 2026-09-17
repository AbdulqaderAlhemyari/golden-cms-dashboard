"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { useOptionalEditorChrome } from "@/components/editor/EditorChromeContext";
import { LanguageTabs, type ContentLocale } from "@/components/shell/LanguageTabs";
import { UpdateWebsiteButton } from "@/components/shell/UpdateWebsiteButton";
import { copy } from "@/lib/copy/ar";
import { getPageTitle, isEditorRoute } from "@/lib/nav";

type TopBarProps = {
  onOpenMenu?: () => void;
};

export function TopBar({ onOpenMenu }: TopBarProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const showEditorControls = isEditorRoute(pathname);
  const editorChrome = useOptionalEditorChrome();

  const [fallbackLocale, setFallbackLocale] = useState<ContentLocale>("ar");
  const [fallbackSaving, setFallbackSaving] = useState(false);

  const locale = editorChrome?.locale ?? fallbackLocale;
  const saving = editorChrome?.saving ?? fallbackSaving;

  async function handleSave() {
    if (editorChrome) {
      editorChrome.save();
      return;
    }
    setFallbackSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setFallbackSaving(false);
    toast.success(copy.saved);
  }

  function handleLocaleChange(next: ContentLocale) {
    if (editorChrome) {
      editorChrome.setLocale(next);
      return;
    }
    setFallbackLocale(next);
  }

  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {onOpenMenu ? (
          <button
            type="button"
            className="btn-ghost shrink-0 px-3 lg:hidden"
            aria-label={copy.openMenu}
            onClick={onOpenMenu}
          >
            ☰
          </button>
        ) : null}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-foreground md:text-2xl">
            {title}
          </h1>
          {editorChrome?.dirty ? (
            <p className="mt-1 text-xs text-primary">{copy.unsavedHint}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <UpdateWebsiteButton variant="compact" />
        {showEditorControls ? (
          <>
            <LanguageTabs value={locale} onChange={handleLocaleChange} />
            <button
              type="button"
              className="btn-primary"
              onClick={() => void handleSave()}
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
