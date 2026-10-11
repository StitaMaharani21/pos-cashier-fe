import {
  CakeSliceIcon,
  CookieIcon,
  CupSodaIcon,
  PackageIcon,
  TagIcon,
  UtensilsCrossedIcon,
  type LucideIcon,
} from "lucide-react"

// The backend stores no icon per category, so one is picked from the name
// (Indonesian + English keywords). Unmatched names get a neutral tag icon in
// a colour picked from the id, so it stays stable between renders.
const RULES: { pattern: RegExp; icon: LucideIcon; tile: string }[] = [
  { pattern: /makan|nasi|mie|ayam|lauk|food|meal|main/i, icon: UtensilsCrossedIcon, tile: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300" },
  { pattern: /minum|kopi|coffee|teh|tea|jus|juice|drink|beverage/i, icon: CupSodaIcon, tile: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-300" },
  { pattern: /camil|snack|gorengan|cemilan/i, icon: CookieIcon, tile: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" },
  { pattern: /dessert|kue|cake|manis|pastry|roti|bakery/i, icon: CakeSliceIcon, tile: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300" },
  { pattern: /paket|combo|hemat|bundle/i, icon: PackageIcon, tile: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300" },
]

const FALLBACK_TILES = [
  "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300",
  "bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-300",
  "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300",
  "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300",
]

export function categoryIcon(name: string, id: number): { icon: LucideIcon; tile: string } {
  const rule = RULES.find((candidate) => candidate.pattern.test(name))
  if (rule) return rule
  return { icon: TagIcon, tile: FALLBACK_TILES[id % FALLBACK_TILES.length] }
}
