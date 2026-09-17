"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { listProjects, type Project } from "@/lib/api/projects";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

type FilterKey = "all" | "visible" | "hidden" | "featured";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: copy.filterAll },
  { key: "visible", label: copy.statusVisible },
  { key: "hidden", label: copy.statusHidden },
  { key: "featured", label: copy.badgeOnHome },
];

export function ProjectsList() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [localItems, setLocalItems] = useState<Project[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => {
    if (filter === "visible") return { draft: "false" as const };
    if (filter === "hidden") return { draft: "true" as const };
    if (filter === "featured") return { featured: "true" as const, draft: "false" as const };
    return { draft: "all" as const, featured: "all" as const };
  }, [filter]);

  const query = useQuery({
    queryKey: ["projects", queryParams, debouncedSearch],
    queryFn: () =>
      listProjects({
        locale: "ar",
        q: debouncedSearch || undefined,
        ...queryParams,
      }),
  });

  useEffect(() => {
    if (query.data) setLocalItems(query.data.items);
  }, [query.data]);

  const items = localItems ?? query.data?.items ?? [];

  function handleUpdated(project: Project) {
    setLocalItems((prev) => {
      const base = prev ?? [];
      return base.map((p) => (p.id === project.id ? project : p));
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                filter === item.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted ring-1 ring-border hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <Link href="/projects/new" className="btn-primary">
          {copy.addProject}
        </Link>
      </div>

      <input
        className="field-input max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={copy.searchProjects}
        aria-label={copy.searchProjects}
      />

      {query.isLoading ? (
        <p className="text-muted">{copy.loading}</p>
      ) : query.isError ? (
        <p className="text-danger">{mapApiError(query.error)}</p>
      ) : items.length === 0 ? (
        <EmptyState
          message={debouncedSearch || filter !== "all" ? copy.noProjectsMatch : copy.noProjects}
          action={
            filter === "all" && !debouncedSearch ? (
              <Link href="/projects/new" className="btn-primary">
                {copy.addProject}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
