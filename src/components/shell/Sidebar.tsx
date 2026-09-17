"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UpdateWebsiteButton } from "@/components/shell/UpdateWebsiteButton";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { settingsLinks, websitePageLinks } from "@/lib/nav";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-orange-50 font-semibold text-primary"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-l border-border bg-surface">
      <div className="border-b border-border px-4 py-5">
        <p className="text-sm font-bold leading-relaxed text-foreground">
          {copy.appTitle}
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        <NavLink href="/overview" label={copy.overview} />

        <NavSection title={copy.nav.websitePages}>
          {websitePageLinks.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </NavSection>

        <div className="space-y-1">
          <NavLink href="/projects" label={copy.nav.projects} />
          <NavLink href="/services" label={copy.nav.services} />
        </div>

        <NavLink href="/media" label={copy.nav.media} />

        <NavSection title={copy.nav.companySettings}>
          {settingsLinks.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </NavSection>
      </nav>

      <div className="space-y-2 border-t border-border px-3 py-4">
        <UpdateWebsiteButton />
        <button type="button" className="btn-ghost w-full justify-start">
          {copy.signOut}
        </button>
      </div>
    </aside>
  );
}
