"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { UpdateWebsiteButton } from "@/components/shell/UpdateWebsiteButton";
import { cn } from "@/lib/cn";
import { copy } from "@/lib/copy/ar";
import { settingsLinks, websitePageLinks } from "@/lib/nav";

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-[var(--touch-min)] items-center rounded-lg px-3 text-sm transition-colors",
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

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    onClose();
    // Close drawer after route changes on tablet/mobile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={copy.closeMenu}
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex h-screen w-72 max-w-[85vw] flex-col border-e border-border bg-surface transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:max-w-none lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-5">
          <p className="text-sm font-bold leading-relaxed text-foreground">
            {copy.appTitle}
          </p>
          <button
            type="button"
            className="btn-ghost shrink-0 px-2 lg:hidden"
            aria-label={copy.closeMenu}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
          <NavLink href="/overview" label={copy.overview} onNavigate={onClose} />

          <NavSection title={copy.nav.websitePages}>
            {websitePageLinks.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                onNavigate={onClose}
              />
            ))}
          </NavSection>

          <div className="space-y-1">
            <NavLink
              href="/projects"
              label={copy.nav.projects}
              onNavigate={onClose}
            />
            <NavLink
              href="/services"
              label={copy.nav.services}
              onNavigate={onClose}
            />
          </div>

          <NavLink href="/media" label={copy.nav.media} onNavigate={onClose} />

          <NavSection title={copy.nav.companySettings}>
            {settingsLinks.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                onNavigate={onClose}
              />
            ))}
          </NavSection>
        </nav>

        <div className="space-y-2 border-t border-border px-3 py-4">
          <UpdateWebsiteButton />
          <button
            type="button"
            className="btn-ghost w-full justify-start"
            onClick={signOut}
          >
            {copy.signOut}
          </button>
        </div>
      </aside>
    </>
  );
}
