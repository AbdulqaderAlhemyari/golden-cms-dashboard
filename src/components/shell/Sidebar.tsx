import type { ReactNode } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy/ar";

const pageLinks = [
  { href: "/pages/home", label: copy.nav.homePage },
  { href: "/pages/about", label: copy.nav.aboutPage },
  { href: "/pages/services", label: copy.nav.servicesPage },
  { href: "/pages/projects", label: copy.nav.projectsPage },
  { href: "/pages/contact", label: copy.nav.contactPage },
  { href: "/pages/terms", label: copy.nav.termsPage },
] as const;

const settingsLinks = [
  { href: "/settings/site", label: copy.nav.siteLogo },
  { href: "/settings/contact", label: copy.nav.contactInfo },
  { href: "/settings/menu", label: copy.nav.websiteMenu },
  { href: "/settings/social", label: copy.nav.socialLinks },
  { href: "/settings/cta", label: copy.nav.ctaBand },
  { href: "/settings/seo", label: copy.nav.seoAppearance },
] as const;

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
    <aside className="flex h-full w-64 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-5">
        <p className="text-sm font-bold leading-relaxed text-slate-900">
          {copy.appTitle}
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        <NavLink href="/overview" label={copy.overview} />

        <NavSection title={copy.nav.websitePages}>
          {pageLinks.map((item) => (
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

      <div className="space-y-2 border-t border-slate-100 px-3 py-4">
        <button
          type="button"
          className="w-full rounded-lg bg-amber-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
        >
          {copy.updateWebsite}
        </button>
        <p className="px-1 text-xs leading-relaxed text-slate-500">
          {copy.updateWebsiteHelp}
        </p>
        <button
          type="button"
          className="w-full rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
        >
          {copy.signOut}
        </button>
      </div>
    </aside>
  );
}
