import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number): string {
  return rupiahFormatter.format(value)
}

// Axis-friendly rupiah: "Rp 0", "Rp 750 rb", "1,5 Jt" — for chart ticks where
// the full "Rp 1.500.000" would not fit.
export function formatCompactRupiah(value: number): string {
  if (value === 0) return "Rp 0"
  const abs = Math.abs(value)
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} Jt`
  }
  if (abs >= 1_000) {
    return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`
  }
  return `Rp ${value}`
}
