import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

type EmptyStateProps = {
  message?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  message = copy.emptyDefault,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-surface flex flex-col items-center justify-center gap-4 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="max-w-md text-base leading-relaxed text-muted">{message}</p>
      {action}
    </div>
  );
}
