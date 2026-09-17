"use client";

import { fields } from "@/lib/copy/fields";
import { cn } from "@/lib/cn";

const ICONS = [
  { id: "check", labelAr: "علامة صح" },
  { id: "shield", labelAr: "درع" },
  { id: "star", labelAr: "نجمة" },
  { id: "award", labelAr: "جائزة" },
  { id: "users", labelAr: "فريق" },
  { id: "building", labelAr: "مبنى" },
  { id: "wrench", labelAr: "أدوات" },
  { id: "flask", labelAr: "مختبر" },
  { id: "leaf", labelAr: "ورقة" },
  { id: "globe", labelAr: "عالم" },
  { id: "heart", labelAr: "قلب" },
  { id: "zap", labelAr: "سرعة" },
] as const;

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
              className={cn(
                "rounded-lg border px-2 py-3 text-center text-xs transition-colors",
                active
                  ? "border-primary bg-orange-50 font-semibold text-primary"
                  : "border-border bg-surface text-slate-700 hover:bg-slate-50",
              )}
            >
              {icon.labelAr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
