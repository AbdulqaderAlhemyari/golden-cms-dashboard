"use client";

import type { ReactNode } from "react";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type SettingsFormShellProps = {
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  unsavedDialog: ReactNode;
  children: ReactNode;
};

export function SettingsFormShell({
  loading,
  error,
  onRetry,
  unsavedDialog,
  children,
}: SettingsFormShellProps) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted">
        {copy.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-danger">{mapApiError(error)}</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          {copy.confirm}
        </button>
      </div>
    );
  }

  return (
    <>
      {unsavedDialog}
      <div className="mx-auto w-full max-w-2xl space-y-6 p-6 md:p-8">
        {children}
      </div>
    </>
  );
}
