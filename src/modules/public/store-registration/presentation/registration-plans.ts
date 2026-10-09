import {
  ChartColumn,
  CreditCard,
  Headset,
  Infinity as InfinityIcon,
  Package,
  QrCode,
  ReceiptText,
  WifiOff,
  type LucideIcon,
} from "lucide-react"

import { MONTHLY_PRICE, STARTER_SOFT_DAILY_LIMIT } from "@/modules/public/shared/pricing"

export type RegistrationPlanId = "starter" | "pro"

export interface RegistrationPlan {
  id: RegistrationPlanId
  name: string
  // False = shown in the picker but not selectable ("Segera hadir").
  available: boolean
  // True = only sold outright. pos-kasir-be gives a registration that pays
  // for nothing (the free trial) the Starter plan, so a plan that can't be had
  // for free must be bought while registering: the store is created on
  // whichever plan was PAID (store_registration.Approve → PaidRegistrationPlan).
  purchaseOnly?: boolean
  // Monthly list price shown on the picker card.
  price: string
  badge: string
  title: string
  description: string
  benefits: { icon: LucideIcon; iconClassName: string; title: string; body: string }[]
}

export const REGISTRATION_PLANS: RegistrationPlan[] = [
  {
    id: "starter",
    name: "Starter",
    available: true,
    price: MONTHLY_PRICE.starter,
    badge: "Mulai di Paket Starter",
    title: "Yang Kamu Dapat Saat Aktif",
    description:
      "Coba gratis atau beli langsung, toko aktif di paket Starter setelah pendaftaran disetujui. Butuh fitur Pro? Pilih Pro Dine-In di atas, atau pindah paket kapan saja lewat tim kami.",
    benefits: [
      {
        icon: WifiOff,
        iconClassName: "text-neela-tertiary",
        title: "Kasir Tetap Jalan Tanpa Internet",
        body: "Koneksi WiFi padam atau sinyal lemah? Kasir tetap cetak struk & terima transaksi tanpa jeda.",
      },
      {
        icon: ReceiptText,
        iconClassName: "text-neela-primary",
        title: "Kasir Tidak Pernah Diblokir",
        body: `Batas ±${STARTER_SOFT_DAILY_LIMIT} transaksi/hari di Starter hanya pengingat untuk pindah paket — kasir tetap jalan saat rush hour.`,
      },
      {
        icon: Headset,
        iconClassName: "text-neela-tertiary",
        title: "Gratis Asistensi Setup via WhatsApp",
        body: "Dibantu memasukkan menu, menyambungkan printer Bluetooth & mengatur meja sampai siap jualan.",
      },
      {
        icon: CreditCard,
        iconClassName: "text-neela-secondary",
        title: "Tanpa Kartu Kredit",
        body: "Tanpa tagihan tersembunyi, tanpa kontrak jangka panjang.",
      },
    ],
  },
  {
    id: "pro",
    name: "Pro Dine-In",
    available: true,
    purchaseOnly: true,
    price: MONTHLY_PRICE.pro,
    badge: "Paket Pro Dine-In",
    title: "Fitur Lengkap Kafe Dine-In",
    description:
      "Semua fitur Starter, ditambah fitur untuk kafe dan restoran dine-in yang ramai. Dibeli langsung lewat QRIS; toko aktif di paket Pro setelah pendaftaran disetujui.",
    benefits: [
      {
        icon: InfinityIcon,
        iconClassName: "text-neela-primary",
        title: "Transaksi Tanpa Batas",
        body: "Tidak ada batas transaksi harian sama sekali.",
      },
      {
        icon: QrCode,
        iconClassName: "text-neela-tertiary",
        title: "Pesan Sendiri Lewat QR Meja",
        body: "Tamu memindai QR di meja lalu memesan sendiri dari HP. Meja dan statusnya mudah diatur.",
      },
      {
        icon: Package,
        iconClassName: "text-neela-secondary",
        title: "Stok Penuh",
        body: "Riwayat stok masuk dan keluar, cek stok fisik, dan pemberitahuan stok menipis.",
      },
      {
        icon: ChartColumn,
        iconClassName: "text-neela-primary",
        title: "Laporan Penjualan, Kas & Untung Rugi",
        body: "Modal per menu dihitung otomatis, plus daftar menu terlaris.",
      },
    ],
  },
]

export const DEFAULT_REGISTRATION_PLAN: RegistrationPlanId = "starter"

// How the visitor starts: "trial" = register for free (the original flow);
// "paid" = register and pay the chosen plan for 1 month by QRIS right away
// (?mode=beli on the landing's "Beli Starter 1 Bulan" button). The backend sells
// Starter and Pro this way; "trial" is Starter only (see `purchaseOnly`).
export type RegistrationPurchaseMode = "trial" | "paid"

export const PURCHASE_MODE_PARAM = "mode"
export const PAID_MODE_PARAM_VALUE = "beli"

export function purchaseModeFromParam(value: string | null): RegistrationPurchaseMode {
  return value === PAID_MODE_PARAM_VALUE ? "paid" : "trial"
}

export function findRegistrationPlan(id: string | null): RegistrationPlan | undefined {
  return REGISTRATION_PLANS.find((plan) => plan.id === id)
}
