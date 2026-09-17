import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";

export type StatusPillVariant = "visible" | "hidden" | "onHome";

const styles: Record<StatusPillVariant, string> = {
  visible: "bg-pill-visible-bg text-pill-visible-fg",
  hidden: "bg-pill-hidden-bg text-pill-hidden-fg",
  onHome: "bg-pill-home-bg text-pill-home-fg",
};

const labels: Record<StatusPillVariant, string> = {
  visible: copy.statusVisible,
  hidden: copy.statusHidden,
  onHome: copy.badgeOnHome,
};

type StatusPillProps = {
  variant: StatusPillVariant;
  className?: string;
};

export function StatusPill({ variant, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      {labels[variant]}
    </span>
  );
}
