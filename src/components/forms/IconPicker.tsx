"use client";

import type { ReactNode } from "react";
import { fields } from "@/lib/copy/fields";
import { cn } from "@/lib/cn";

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto h-6 w-6"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const ICONS = [
  {
    id: "check",
    labelAr: "علامة صح",
    icon: (
      <IconSvg>
        <path d="M20 6 9 17l-5-5" />
      </IconSvg>
    ),
  },
  {
    id: "shield",
    labelAr: "درع",
    icon: (
      <IconSvg>
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      </IconSvg>
    ),
  },
  {
    id: "star",
    labelAr: "نجمة",
    icon: (
      <IconSvg>
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </IconSvg>
    ),
  },
  {
    id: "award",
    labelAr: "جائزة",
    icon: (
      <IconSvg>
        <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        <circle cx="12" cy="8" r="6" />
      </IconSvg>
    ),
  },
  {
    id: "users",
    labelAr: "فريق",
    icon: (
      <IconSvg>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </IconSvg>
    ),
  },
  {
    id: "building",
    labelAr: "مبنى",
    icon: (
      <IconSvg>
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M12 18h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M16 18h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
        <path d="M8 18h.01" />
        <path d="M9 22v-3.172a2 2 0 0 1 .586-1.414l.828-.828A2 2 0 0 0 11.828 16h.344a2 2 0 0 0 1.414.586l.828.828A2 2 0 0 1 15 18.828V22" />
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      </IconSvg>
    ),
  },
  {
    id: "wrench",
    labelAr: "أدوات",
    icon: (
      <IconSvg>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </IconSvg>
    ),
  },
  {
    id: "flask",
    labelAr: "مختبر",
    icon: (
      <IconSvg>
        <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
        <path d="M6.453 15h11.094" />
        <path d="M8.5 2h7" />
      </IconSvg>
    ),
  },
  {
    id: "leaf",
    labelAr: "ورقة",
    icon: (
      <IconSvg>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </IconSvg>
    ),
  },
  {
    id: "globe",
    labelAr: "عالم",
    icon: (
      <IconSvg>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </IconSvg>
    ),
  },
  {
    id: "heart",
    labelAr: "قلب",
    icon: (
      <IconSvg>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </IconSvg>
    ),
  },
  {
    id: "zap",
    labelAr: "سرعة",
    icon: (
      <IconSvg>
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </IconSvg>
    ),
  },
] as const;

/** Allowed icon IDs stored in page content (shared with website mapping). */
export const ICON_IDS = ICONS.map((icon) => icon.id);

type IconPickerProps = {
  label?: string;
  value?: string;
  onChange: (icon: string) => void;
};

export function IconPicker({
  label = fields.iconLabel,
  value = "",
  onChange,
}: IconPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {ICONS.map((icon) => {
          const active = value === icon.id;
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onChange(icon.id)}
              title={icon.labelAr}
              aria-label={icon.labelAr}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors",
                active
                  ? "border-primary bg-orange-50 font-semibold text-primary"
                  : "border-border bg-surface text-slate-700 hover:bg-slate-50",
              )}
            >
              {icon.icon}
              <span className="text-[11px] leading-tight">{icon.labelAr}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
