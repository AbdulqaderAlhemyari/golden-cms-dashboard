"use client";

import { useMemo, useState, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Activity,
  Award,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Box,
  Briefcase,
  Building2,
  Check,
  ClipboardCheck,
  Clock,
  Compass,
  Construction,
  Cpu,
  Database,
  Droplets,
  Eye,
  Factory,
  Flag,
  Flame,
  FlaskConical,
  Globe,
  Hammer,
  Handshake,
  HardHat,
  Heart,
  Home,
  KeyRound,
  Layers,
  Leaf,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Microscope,
  Package,
  Paintbrush,
  Phone,
  Puzzle,
  Recycle,
  Rocket,
  Ruler,
  Scale,
  Search,
  Settings,
  Shield,
  Smile,
  Sparkles,
  Star,
  Store,
  Sun,
  Target,
  ThumbsUp,
  TrendingUp,
  Truck,
  Users,
  Warehouse,
  Wifi,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { fields } from "@/lib/copy/fields";
import { cn } from "@/lib/cn";

type LucideIcon = ComponentType<LucideProps>;

type IconDef = {
  id: string;
  labelAr: string;
  Icon: LucideIcon;
};

/**
 * Allowed icon IDs stored in page content.
 * Keep in sync with andromeda `lib/cms/icons.js`.
 */
const ICONS: IconDef[] = [
  { id: "check", labelAr: "علامة صح", Icon: Check },
  { id: "badge-check", labelAr: "تحقق", Icon: BadgeCheck },
  { id: "shield", labelAr: "درع", Icon: Shield },
  { id: "lock", labelAr: "قفل", Icon: Lock },
  { id: "key", labelAr: "مفتاح", Icon: KeyRound },
  { id: "star", labelAr: "نجمة", Icon: Star },
  { id: "award", labelAr: "جائزة", Icon: Award },
  { id: "thumbs-up", labelAr: "إعجاب", Icon: ThumbsUp },
  { id: "sparkles", labelAr: "تميز", Icon: Sparkles },
  { id: "smile", labelAr: "رضا", Icon: Smile },
  { id: "users", labelAr: "فريق", Icon: Users },
  { id: "handshake", labelAr: "شراكة", Icon: Handshake },
  { id: "building", labelAr: "مبنى", Icon: Building2 },
  { id: "home", labelAr: "منزل", Icon: Home },
  { id: "factory", labelAr: "مصنع", Icon: Factory },
  { id: "warehouse", labelAr: "مستودع", Icon: Warehouse },
  { id: "store", labelAr: "متجر", Icon: Store },
  { id: "wrench", labelAr: "أدوات", Icon: Wrench },
  { id: "hammer", labelAr: "مطرقة", Icon: Hammer },
  { id: "hard-hat", labelAr: "خوذة", Icon: HardHat },
  { id: "construction", labelAr: "إنشاءات", Icon: Construction },
  { id: "settings", labelAr: "إعدادات", Icon: Settings },
  { id: "flask", labelAr: "مختبر", Icon: FlaskConical },
  { id: "microscope", labelAr: "مجهر", Icon: Microscope },
  { id: "leaf", labelAr: "بيئة", Icon: Leaf },
  { id: "recycle", labelAr: "إعادة تدوير", Icon: Recycle },
  { id: "droplet", labelAr: "ماء", Icon: Droplets },
  { id: "sun", labelAr: "شمس", Icon: Sun },
  { id: "wind", labelAr: "رياح", Icon: Wind },
  { id: "globe", labelAr: "عالم", Icon: Globe },
  { id: "compass", labelAr: "بوصلة", Icon: Compass },
  { id: "map-pin", labelAr: "موقع", Icon: MapPin },
  { id: "flag", labelAr: "علم", Icon: Flag },
  { id: "heart", labelAr: "قلب", Icon: Heart },
  { id: "zap", labelAr: "سرعة", Icon: Zap },
  { id: "flame", labelAr: "شعلة", Icon: Flame },
  { id: "activity", labelAr: "نشاط", Icon: Activity },
  { id: "rocket", labelAr: "انطلاق", Icon: Rocket },
  { id: "lightbulb", labelAr: "فكرة", Icon: Lightbulb },
  { id: "target", labelAr: "هدف", Icon: Target },
  { id: "eye", labelAr: "رؤية", Icon: Eye },
  { id: "search", labelAr: "بحث", Icon: Search },
  { id: "book-open", labelAr: "معرفة", Icon: BookOpen },
  { id: "clipboard-check", labelAr: "قائمة تحقق", Icon: ClipboardCheck },
  { id: "briefcase", labelAr: "حقيبة عمل", Icon: Briefcase },
  { id: "package", labelAr: "طرود", Icon: Package },
  { id: "box", labelAr: "صندوق", Icon: Box },
  { id: "truck", labelAr: "نقل", Icon: Truck },
  { id: "layers", labelAr: "طبقات", Icon: Layers },
  { id: "puzzle", labelAr: "حل", Icon: Puzzle },
  { id: "scale", labelAr: "ميزان", Icon: Scale },
  { id: "trending-up", labelAr: "نمو", Icon: TrendingUp },
  { id: "bar-chart", labelAr: "إحصائيات", Icon: BarChart3 },
  { id: "megaphone", labelAr: "إعلان", Icon: Megaphone },
  { id: "phone", labelAr: "هاتف", Icon: Phone },
  { id: "mail", labelAr: "بريد", Icon: Mail },
  { id: "clock", labelAr: "وقت", Icon: Clock },
  { id: "cpu", labelAr: "تقنية", Icon: Cpu },
  { id: "wifi", labelAr: "شبكة", Icon: Wifi },
  { id: "database", labelAr: "بيانات", Icon: Database },
  { id: "paintbrush", labelAr: "تصميم", Icon: Paintbrush },
  { id: "ruler", labelAr: "قياس", Icon: Ruler },
];

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter(
      (icon) =>
        icon.id.includes(q) ||
        icon.labelAr.includes(query.trim()) ||
        icon.labelAr.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-2">
      <p className="field-label">{label}</p>
      <p className="text-xs leading-relaxed text-muted">{fields.iconHelp}</p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={fields.iconSearchPlaceholder}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <div className="max-h-64 overflow-y-auto rounded-lg border border-border p-2">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {filtered.map((icon) => {
            const active = value === icon.id;
            const Icon = icon.Icon;
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
                <Icon className="h-6 w-6" aria-hidden />
                <span className="text-[11px] leading-tight">{icon.labelAr}</span>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted">لا توجد نتائج</p>
        ) : null}
      </div>
    </div>
  );
}
