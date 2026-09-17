"use client";

import { useMemo, useState } from "react";
import { usePageEditor } from "@/hooks/usePageEditor";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { fields } from "@/lib/copy/fields";
import { mapApiError } from "@/lib/errors/mapApiError";
import { pageSectionRegistry } from "@/lib/pages/registry";
import type { ApiPageKey } from "@/lib/pages/types";

type PageEditorProps = {
  pageKey: ApiPageKey;
};

export function PageEditor({ pageKey }: PageEditorProps) {
  const sections = pageSectionRegistry[pageKey] ?? [];
  const firstKey = sections.find((s) => !s.collapsedByDefault)?.key ?? sections[0]?.key;
  const [activeKey, setActiveKey] = useState<string | null>(firstKey ?? null);

  const {
    draft,
    updateSection,
    loading,
    error,
    reload,
    unsavedDialog,
    dirty,
    saving,
  } = usePageEditor(pageKey);

  const activeSection = useMemo(
    () => sections.find((s) => s.key === activeKey) ?? sections[0],
    [sections, activeKey],
  );

  if (!sections.length) {
    return (
      <div className="p-8 text-muted">{copy.pageEditorComingSoon}</div>
    );
  }

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
        <button type="button" className="btn-secondary" onClick={() => void reload()}>
          {copy.confirm}
        </button>
      </div>
    );
  }

  const ActiveForm = activeSection?.component;

  return (
    <>
      {unsavedDialog}
      <div className="flex flex-1 flex-col gap-6 p-6 md:flex-row md:p-8">
        <aside className="w-full shrink-0 md:w-64">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {fields.sectionsHeading}
          </p>
          <nav className="space-y-1">
            {sections.map((section) => {
              const isActive = section.key === activeSection?.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveKey(section.key)}
                  className={cn(
                    "w-full rounded-lg px-3 py-3 text-start text-sm transition-colors",
                    isActive
                      ? "bg-orange-50 font-semibold text-primary"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {section.titleAr}
                  {section.collapsedByDefault ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted">
                      {copy.moreOptions}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          {dirty ? (
            <p className="mt-4 text-xs text-primary">
              {saving ? copy.saving : copy.unsavedHint}
            </p>
          ) : null}
        </aside>

        <section className="card-surface min-w-0 flex-1 p-5 md:p-6">
          {activeSection && ActiveForm ? (
            <>
              <h2 className="mb-5 text-lg font-bold text-foreground">
                {activeSection.titleAr}
              </h2>
              <ActiveForm
                value={draft[activeSection.key] ?? {}}
                onChange={(value: unknown) =>
                  updateSection(activeSection.key, value)
                }
              />
            </>
          ) : (
            <p className="text-muted">{fields.selectSection}</p>
          )}
        </section>
      </div>
    </>
  );
}
