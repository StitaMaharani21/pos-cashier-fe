import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  QrCodeIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

// Icon + soft-tinted tile color per payment method type — the list rows and
// the detail panel header.
export const TYPE_META: Record<string, { icon: LucideIcon; tile: string }> = {
  cash: { icon: BanknoteIcon, tile: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" },
  card: { icon: CreditCardIcon, tile: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" },
  transfer: { icon: LandmarkIcon, tile: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" },
  ewallet: { icon: WalletIcon, tile: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  qris: { icon: QrCodeIcon, tile: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300" },
}
