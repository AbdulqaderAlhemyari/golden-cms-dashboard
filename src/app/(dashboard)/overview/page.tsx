import Link from "next/link";
import { copy } from "@/lib/copy/ar";

const shortcuts = [
  { href: "/pages/home", label: copy.shortcutEditHome },
  { href: "/projects/new", label: copy.shortcutAddProject },
  { href: "/settings/contact", label: copy.shortcutChangePhone },
] as const;

export default function OverviewPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 p-8 md:p-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          {copy.overview}
        </h1>
        <p className="text-lg text-slate-600">{copy.overviewPrompt}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white px-5 py-6 text-base font-semibold text-slate-800 shadow-sm transition-colors hover:border-amber-300 hover:bg-amber-50"
          >
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
