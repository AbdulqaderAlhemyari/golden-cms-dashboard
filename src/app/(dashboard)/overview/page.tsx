import Link from "next/link";
import { StatusPill } from "@/components/feedback/StatusPill";
import { copy } from "@/lib/copy/ar";

const shortcuts = [
  { href: "/pages/home", label: copy.shortcutEditHome },
  { href: "/projects/new", label: copy.shortcutAddProject },
  { href: "/settings/contact", label: copy.shortcutChangePhone },
] as const;

export default function OverviewPage() {
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

      <section className="card-surface space-y-3 p-5">
        <p className="text-sm font-semibold text-foreground">
          {copy.contentStatus}
        </p>
        <div className="flex flex-wrap gap-2">
          <StatusPill variant="visible" />
          <StatusPill variant="hidden" />
          <StatusPill variant="onHome" />
        </div>
      </section>
    </div>
  );
}
