"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ServiceCard } from "@/components/services/ServiceCard";
import { listServices, type Service } from "@/lib/api/services";
import { copy } from "@/lib/copy/ar";
import { mapApiError } from "@/lib/errors/mapApiError";

export function ServicesList() {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [localItems, setLocalItems] = useState<Service[] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const query = useQuery({
    queryKey: ["services", debounced],
    queryFn: () =>
      listServices({
        locale: "ar",
        draft: "all",
        q: debounced || undefined,
      }),
  });

  useEffect(() => {
    if (query.data) setLocalItems(query.data.items);
  }, [query.data]);

  const items = localItems ?? query.data?.items ?? [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
      <input
        className="field-input max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={copy.searchServices}
        aria-label={copy.searchServices}
      />

      {query.isLoading ? (
        <p className="text-muted">{copy.loading}</p>
      ) : query.isError ? (
        <p className="text-danger">{mapApiError(query.error)}</p>
      ) : items.length === 0 ? (
        <EmptyState
          message={debounced ? copy.noServicesMatch : copy.noServicesYet}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onUpdated={(next) =>
                setLocalItems((prev) =>
                  (prev ?? []).map((s) => (s.id === next.id ? next : s)),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
