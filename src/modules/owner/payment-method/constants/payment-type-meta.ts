import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  QrCodeIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

// Icon + badge color per payment method type — shared by the table's
// "Metode" column and the form's type picker.
export const TYPE_META: Record<string, { icon: LucideIcon; className: string }> = {
  qris: { icon: QrCodeIcon, className: "bg-blue-600" },
  card: { icon: CreditCardIcon, className: "bg-violet-600" },
  ewallet: { icon: WalletIcon, className: "bg-teal-500" },
  cash: { icon: BanknoteIcon, className: "bg-amber-500" },
  transfer: { icon: LandmarkIcon, className: "bg-sky-600" },
}
