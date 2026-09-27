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
  cash: { icon: BanknoteIcon, tile: "bg-amber-100 text-amber-700" },
  card: { icon: CreditCardIcon, tile: "bg-violet-100 text-violet-700" },
  transfer: { icon: LandmarkIcon, tile: "bg-sky-100 text-sky-700" },
  ewallet: { icon: WalletIcon, tile: "bg-emerald-100 text-emerald-700" },
  qris: { icon: QrCodeIcon, tile: "bg-blue-100 text-blue-700" },
}
