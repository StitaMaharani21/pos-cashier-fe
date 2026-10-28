import {
  BadgeCheck,
  ChartColumn,
  ClipboardList,
  CreditCard,
  Headset,
  Infinity as InfinityIcon,
  Package,
  QrCode,
  ReceiptText,
  Rocket,
  WifiOff,
  type LucideIcon,
} from "lucide-react"

import { resolveIcon } from "@/modules/public/shared/cms/cms.icons"
import { formatRupiah, makeReader, TONE_ICON_CLASS } from "@/modules/public/shared/cms/cms.reader"
import type { CmsItem, CmsSnapshot } from "@/modules/public/shared/cms/cms.types"
import { MONTHLY_PRICE, STARTER_SOFT_DAILY_LIMIT } from "@/modules/public/shared/pricing"

export type RegistrationPlanId = "starter" | "pro"

export interface RegistrationBenefit {
  icon: LucideIcon
  iconClassName: string
  title: string
  body: string
}

export interface RegistrationPlan {
  id: RegistrationPlanId
  name: string
  // False = shown in the picker but not selectable ("Segera hadir").
  available: boolean
  // True = only sold outright. pos-kasir-be gives a registration that pays
  // for nothing (the free trial) the Starter plan, so a plan that can't be had
  // for free must be bought while registering: the store is created on
  // whichever plan was PAID (store_registration.Approve → PaidRegistrationPlan).
  // A behaviour flag tied to the backend, so it stays in code, not in the CMS.
  purchaseOnly?: boolean
  // Monthly list price shown on the picker card.
  price: string
  badge: string
  title: string
  description: string
  benefits: RegistrationBenefit[]
}

export interface RegistrationStep {
  icon: LucideIcon
  title: string
  body: string
}

export interface RegistrationContent {
  plans: RegistrationPlan[]
  stepsTitle: string
  steps: RegistrationStep[]
}

function staticBenefits(softLimit: number) {
  const starter: RegistrationBenefit[] = [
    {
      icon: WifiOff,
      iconClassName: "text-neela-tertiary",
      title: "Kasir Tetap Jalan Tanpa Internet",
      body: "Koneksi WiFi padam atau sinyal lemah? Kasir tetap cetak struk & terima transaksi tanpa jeda.",
    },
    {
      icon: ReceiptText,
      iconClassName: "text-neela-primary",
      title: "Kasir Tidak Pernah Terkunci",
      body: `Perkiraan ±${softLimit} transaksi per hari di Starter hanya patokan untuk naik paket — kasir tetap jalan saat jam ramai.`,
    },
    {
      icon: Headset,
      iconClassName: "text-neela-tertiary",
      title: "Gratis Bantuan Pemasangan lewat WhatsApp",
      body: "Dibantu memasukkan menu, menyambungkan printer Bluetooth & mengatur meja sampai siap jualan.",
    },
    {
      icon: CreditCard,
      iconClassName: "text-neela-secondary",
      title: "Tanpa Kartu Kredit",
      body: "Tanpa tagihan tersembunyi, tanpa kontrak jangka panjang.",
    },
  ]
  const pro: RegistrationBenefit[] = [
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
      title: "Catat Stok Lengkap",
      body: "Riwayat stok masuk dan keluar, cocokkan stok, dan pemberitahuan stok menipis.",
    },
    {
      icon: ChartColumn,
      iconClassName: "text-neela-primary",
      title: "Laporan Penjualan, Uang Kas, dan Untung Rugi",
      body: "Modal per menu dihitung otomatis, plus daftar menu terlaris.",
    },
  ]
  return { starter, pro }
}

const STATIC_STEPS: RegistrationStep[] = [
  { icon: ClipboardList, title: "Isi formulir", body: "Data toko & akun pemilik." },
  { icon: BadgeCheck, title: "Verifikasi tim Neela", body: "Kami tinjau dan hubungi Anda." },
  { icon: Rocket, title: "Toko siap dipakai", body: "Masuk dengan email & kata sandi." },
]

function benefitsFrom(items: CmsItem[] | undefined, fallback: RegistrationBenefit[]): RegistrationBenefit[] {
  return (
    items?.map((i) => ({
      icon: resolveIcon(i.icon),
      iconClassName: TONE_ICON_CLASS[i.tone ?? ""] ?? TONE_ICON_CLASS.primary,
      title: i.title,
      body: i.body ?? "",
    })) ?? fallback
  )
}

// The registration page's plan picker and copy: the published CMS snapshot over
// the static defaults above (null = the page exactly as it was before the CMS).
// Prices follow the same CMS plans as the landing, so the two pages never differ.
export function buildRegistrationContent(snapshot: CmsSnapshot | null | undefined): RegistrationContent {
  const r = makeReader(snapshot)
  const benefits = staticBenefits(r.setting("starter_soft_daily_limit", STARTER_SOFT_DAILY_LIMIT))
  const priceOf = (code: "starter" | "pro") => {
    const p = r.plan(code)
    return p ? formatRupiah(p.price) : MONTHLY_PRICE[code]
  }

  const plans: RegistrationPlan[] = [
    {
      id: "starter",
      name: r.plan("starter")?.name ?? "Starter",
      available: true,
      price: priceOf("starter"),
      badge: r.text("registration", "starter_badge", "Mulai di Paket Starter"),
      title: r.text("registration", "starter_title", "Yang Anda Dapat Saat Aktif"),
      description: r.text(
        "registration",
        "starter_description",
        "Coba gratis atau beli langsung, toko aktif di paket Starter setelah pendaftaran disetujui. Butuh fitur Pro? Pilih Pro untuk Makan di Tempat di atas, atau pindah paket kapan saja lewat tim kami."
      ),
      benefits: benefitsFrom(r.list("reg_benefits_starter"), benefits.starter),
    },
    {
      id: "pro",
      name: r.text("registration", "pro_name", "Pro untuk Makan di Tempat"),
      available: true,
      purchaseOnly: true,
      price: priceOf("pro"),
      badge: r.text("registration", "pro_badge", "Paket Pro untuk Makan di Tempat"),
      title: r.text("registration", "pro_title", "Fitur Lengkap untuk Kafe dan Restoran"),
      description: r.text(
        "registration",
        "pro_description",
        "Semua fitur Starter, ditambah fitur untuk kafe dan restoran yang ramai. Dibeli langsung lewat QRIS; toko aktif di paket Pro setelah pendaftaran disetujui."
      ),
      benefits: benefitsFrom(r.list("reg_benefits_pro"), benefits.pro),
    },
  ]

  return {
    plans,
    stepsTitle: r.text("registration", "steps_title", "Alur Pendaftaran"),
    steps:
      r.list("reg_steps")?.map((i) => ({ icon: resolveIcon(i.icon), title: i.title, body: i.body ?? "" })) ??
      STATIC_STEPS,
  }
}

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

export function findRegistrationPlan(plans: RegistrationPlan[], id: string | null): RegistrationPlan | undefined {
  return plans.find((plan) => plan.id === id)
}
