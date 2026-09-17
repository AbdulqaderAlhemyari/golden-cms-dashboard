"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { copy } from "@/lib/copy/ar";

/**
 * Warn before leaving the page with unsaved edits (browser unload + in-app links).
 */
export function useUnsavedChanges(dirty: boolean) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;

    function onDocumentClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (anchor.target === "_blank") return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === pathname) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [dirty, pathname]);

  const confirmLeave = useCallback(() => {
    if (!pendingHref) return;
    const href = pendingHref;
    setPendingHref(null);
    window.location.assign(href);
  }, [pendingHref]);

  const cancelLeave = useCallback(() => {
    setPendingHref(null);
  }, []);

  const dialog = (
    <ConfirmDialog
      open={pendingHref !== null}
      title={copy.unsavedChanges}
      confirmLabel={copy.confirm}
      cancelLabel={copy.cancel}
      danger
      onConfirm={confirmLeave}
      onCancel={cancelLeave}
    />
  );

  return { dialog, hasPendingNavigation: pendingHref !== null };
}
