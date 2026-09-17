"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill } from "@/components/feedback/StatusPill";
import {
  getProjectCounts,
  type ProjectCounts,
} from "@/lib/api/projects";
import { copy } from "@/lib/copy/ar";

const shortcuts = [
  { href: "/pages/home", label: copy.shortcutEditHome },
  { href: "/projects/new", label: copy.shortcutAddProject },
  { href: "/settings/contact", label: copy.shortcutChangePhone },
] as const;

function withCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

export function OverviewContent() {
  const [counts, setCounts] = useState<ProjectCounts | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getProjectCounts();
        if (!cancelled) {
          setCounts(data);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 md:p-8">
      <p className="text-lg text-muted">{copy.overviewPrompt}</p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-surface px-5 py-6 text-base font-semibold text-foreground transition-colors hover:border-accent"
          >
            {item.label}
          </Link>
        ))}
      </section>

      <section className="card-surface space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">
            {copy.projectsSummary}
          </p>
          <Link
            href="/projects"
            className="text-sm font-semibold text-primary hover:underline"
          >
            {copy.viewAllProjects}
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted">{copy.loading}</p>
        ) : error ? (
          <p className="text-sm text-danger">{copy.projectsLoadFailed}</p>
        ) : counts ? (
          <div className="space-y-3">
            <p className="text-base text-foreground">
              {withCount(copy.projectsVisibleCount, counts.visible)}
              {" · "}
              {withCount(copy.projectsHiddenCount, counts.hidden)}
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusPill variant="visible" />
              <span className="text-sm text-muted">{counts.visible}</span>
              <StatusPill variant="hidden" />
              <span className="text-sm text-muted">{counts.hidden}</span>
              <StatusPill variant="onHome" />
              <span className="text-sm text-muted">{counts.featured}</span>
            </div>
            <p className="text-xs text-muted">
              {withCount(copy.projectsFeaturedCount, counts.featured)}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
