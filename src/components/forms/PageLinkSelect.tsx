"use client";

import { fields } from "@/lib/copy/fields";
import { cn } from "@/lib/cn";

export const SITE_PAGE_OPTIONS = [
  { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "/about", labelAr: "من نحن", labelEn: "About" },
  { href: "/services", labelAr: "خدماتنا", labelEn: "Services" },
  { href: "/projects", labelAr: "مشاريعنا", labelEn: "Projects" },
  { href: "/contact", labelAr: "اتصل بنا", labelEn: "Contact" },
  { href: "/terms-policy", labelAr: "الشروط والسياسات", labelEn: "Terms" },
] as const;

type PageLinkSelectProps = {
  label: string;
  value: string;
  onChange: (href: string) => void;
  allowCustom?: boolean;
  className?: string;
};

export function PageLinkSelect({
  label,
  value,
  onChange,
  allowCustom = true,
  className,
}: PageLinkSelectProps) {
  const known = SITE_PAGE_OPTIONS.some((o) => o.href === value);
  const selectValue = known ? value : "__custom__";

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      <select
        className="field-input"
        value={selectValue}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            onChange(value && !known ? value : "");
            return;
          }
          onChange(e.target.value);
        }}
      >
        <option value="">{fields.pageLinkPlaceholder}</option>
        {SITE_PAGE_OPTIONS.map((opt) => (
          <option key={opt.href} value={opt.href}>
            {opt.labelAr}
          </option>
        ))}
        {allowCustom ? (
          <option value="__custom__">{fields.pageLinkCustom}</option>
        ) : null}
      </select>
      {allowCustom && selectValue === "__custom__" ? (
        <input
          className="field-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fields.pageLinkCustomPlaceholder}
          aria-label={fields.pageLinkCustom}
        />
      ) : null}
    </div>
  );
}
