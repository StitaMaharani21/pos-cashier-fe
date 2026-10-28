import {
  Armchair,
  BadgeCheck,
  Banknote,
  BarChart3,
  Bell,
  ChartColumn,
  Check,
  ClipboardList,
  Clock,
  CreditCard,
  Headset,
  Info,
  Infinity as InfinityIcon,
  Lock,
  type LucideIcon,
  MessageSquarePlus,
  Monitor,
  Package,
  PackageSearch,
  Printer,
  QrCode,
  Receipt,
  ReceiptText,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Timer,
  TrendingUp,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react"

// Icon names the CMS may reference (cms_list_item.icon, cms_plan_feature.icon,
// cms_testimonial.metric_icon). Lucide components are code, not data, so the CMS
// stores a name and this registry resolves it — adding an icon to the CMS means
// adding it here. Names are lucide's own; "BanknoteIcon" is kept because the
// seed uses it.
export const CMS_ICONS = {
  Armchair,
  BadgeCheck,
  Banknote,
  BanknoteIcon: Banknote,
  BarChart3,
  Bell,
  ChartColumn,
  Check,
  ClipboardList,
  Clock,
  CreditCard,
  Headset,
  Info,
  Infinity: InfinityIcon,
  Lock,
  MessageSquarePlus,
  Monitor,
  Package,
  PackageSearch,
  Printer,
  QrCode,
  Receipt,
  ReceiptText,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Timer,
  TrendingUp,
  Users,
  Wallet,
  WifiOff,
} satisfies Record<string, LucideIcon>

export const CMS_ICON_NAMES = Object.keys(CMS_ICONS)

// An unknown name must never blank a section: fall back to a neutral icon.
export function resolveIcon(name: string | undefined, fallback: LucideIcon = Info): LucideIcon {
  if (!name) return fallback
  return (CMS_ICONS as Record<string, LucideIcon>)[name] ?? fallback
}
