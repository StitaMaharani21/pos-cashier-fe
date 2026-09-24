import {
  Armchair,
  Ban,
  ChartColumn,
  Headset,
  Infinity as InfinityIcon,
  Lock,
  MessageCircle,
  MessageSquarePlus,
  ScanQrCode,
  Timer,
  Wallet,
  WifiOff,
  type LucideIcon,
} from "lucide-react"

import { REGISTER_PATH, SUPPORT_HOURS } from "@/modules/public/shared/contact"
import { MONTHLY_PRICE, STARTER_SOFT_DAILY_LIMIT } from "@/modules/public/shared/pricing"

// All landing copy in one place — per the "Konten Landing Page — Neela POS"
// brief, laid over the Stitch design's section order, then tightened to
// short, one-idea lines. Static marketing content: pos-kasir-be has no
// CMS/promotion backend (see ARCHITECTURE.md), so editing the page means
// editing this file.
//
// The page is in "early access" mode (the brief's Opsi A) while Neela has
// no live customers yet: no customer logos, no testimonials. Filling in
// SOCIAL_PROOF / TESTIMONIALS below switches those sections to the brief's
// Opsi B automatically — only do that with real, owner-approved content.

// The primary CTA (components/PrimaryCta.tsx): visitors go to the store
// registration page, a logged-in owner gets a way back into the console
// instead — never a "sign up" prompt for someone who already has a store.
export const PRIMARY_CTA = {
  visitor: { label: "Daftar Early Access", to: REGISTER_PATH },
  owner: { label: "Buka Dashboard", to: "/app" },
} as const

// ---------------------------------------------------------------------------
// Social proof — Opsi B content. Leave empty/null until it's real.

export interface TrustedBrand {
  name: string
  icon: LucideIcon
  iconClassName: string
}

export const SOCIAL_PROOF: { headline: string; brands: TrustedBrand[] } | null = null

export interface Testimonial {
  quote: string
  metric: string
  metricIcon: LucideIcon
  metricClassName: string
  name: string
  role: string
  initials: string
  avatarClassName: string
}

// Only publish quotes verified with the store owner in question.
export const TESTIMONIALS: Testimonial[] = []

// Opsi A — shown while SOCIAL_PROOF is null.
export const EARLY_ACCESS_TRUST = {
  headline:
    "Bergabung dalam gelombang pertama kafe & resto yang beralih ke sistem kasir offline-first",
  subline: "Sedang membuka slot terbatas untuk toko pilot di Jakarta",
}

// Opsi A — shown while TESTIMONIALS is empty.
export const EARLY_ACCESS_PERKS: { icon: LucideIcon; iconClassName: string; title: string; body: string }[] = [
  {
    icon: Lock,
    iconClassName: "bg-neela-primary-fixed text-neela-primary",
    title: "Harga terkunci 6 bulan",
    body: "Harga langganan tidak naik selama 6 bulan pertama.",
  },
  {
    icon: Headset,
    iconClassName: "bg-neela-tertiary-fixed text-neela-tertiary",
    title: "Setup dibantu tim kami",
    body: "Input menu dan printer, sampai toko siap jualan.",
  },
  {
    icon: MessageSquarePlus,
    iconClassName: "bg-neela-secondary-fixed text-neela-on-secondary-fixed",
    title: "Request fitur diprioritaskan",
    body: "Masukan toko pilot masuk roadmap lebih dulu.",
  },
]

// ---------------------------------------------------------------------------

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "#fitur", label: "Fitur" },
  { href: "#keunggulan", label: "Keunggulan" },
  { href: "#harga", label: "Harga" },
  TESTIMONIALS.length > 0
    ? { href: "#testimoni", label: "Testimoni" }
    : { href: "#pilot", label: "Cerita Pilot" },
  { href: "#kontak", label: "Kontak" },
]

export const HERO_TRUST_SIGNALS = [
  "Tanpa kartu kredit",
  "Setup dibantu tim",
  `Support WhatsApp ${SUPPORT_HOURS}`,
] as const

export const PAIN_POINTS: { icon: LucideIcon; title: string; body: string; impact: string }[] = [
  {
    icon: Ban,
    title: "Limit Transaksi Tiba-Tiba",
    body: "Kafe sedang ramai, kasir malah terkunci dan dipaksa upgrade.",
    impact: "Antrean macet, omset hangus.",
  },
  {
    icon: WifiOff,
    title: "WiFi Mati, Kasir Lumpuh",
    body: "POS berbasis browser berhenti saat internet putus. Pesanan dicatat di kertas.",
    impact: "Order salah, tamu komplain.",
  },
  {
    icon: Wallet,
    title: "Biaya Tersembunyi & CS Lambat",
    body: "Tambah printer atau kasir, tambah biaya. CS baru membalas berhari-hari.",
    impact: "Biaya bengkak, masalah tak selesai.",
  },
]

export const PILLARS: {
  icon: LucideIcon
  iconClassName: string
  taglineClassName: string
  title: string
  tagline: string
  body: string
  tags: string[]
  highlightTag: string
}[] = [
  {
    icon: Timer,
    iconClassName: "bg-neela-primary-fixed text-neela-primary",
    taglineClassName: "text-neela-primary",
    title: "Tetap Jalan Tanpa Internet",
    tagline: "WiFi mati, kasir tetap jualan.",
    body: "Struk dan tiket dapur tetap tercetak. Data tersinkron otomatis begitu online.",
    tags: ["Offline-First", "Nol Latensi"],
    highlightTag: "Auto-Sync",
  },
  {
    icon: InfinityIcon,
    iconClassName: "bg-neela-tertiary-fixed text-neela-tertiary",
    taglineClassName: "text-neela-tertiary",
    title: "Checkout Tak Pernah Diblokir",
    tagline: "Batas harian Starter cuma pengingat, bukan pemblokir.",
    body: "Lewat batas beberapa hari? Kami kirim notifikasi upgrade — kasir tetap jalan.",
    tags: ["Grace Period 3 Hari"],
    highlightTag: "Biaya Flat",
  },
  {
    icon: MessageCircle,
    iconClassName: "bg-neela-secondary-fixed text-neela-on-secondary-fixed",
    taglineClassName: "text-neela-secondary",
    title: "Support Tim Lokal",
    tagline: `WhatsApp ${SUPPORT_HOURS}.`,
    body: "Tim Jakarta yang paham kafe & resto — dari setup menu sampai troubleshooting.",
    tags: ["Onboarding Dipandu"],
    highlightTag: "Teknisi Jabodetabek",
  },
]

export const MINI_FEATURES: { icon: LucideIcon; title: string; body: string; badge?: string }[] = [
  {
    icon: Armchair,
    title: "Meja & Split Bill",
    body: "Gabung, pindah meja, atau split bill dalam 2 detik.",
    badge: "Pro ke atas",
  },
  {
    icon: ScanQrCode,
    title: "QRIS Semua E-Wallet",
    body: "BCA, Mandiri, GoPay, OVO, ShopeePay & Dana.",
  },
  {
    icon: ChartColumn,
    title: "Omset & Stok dari HP",
    body: "Laporan harian dan notifikasi stok menipis, real-time.",
  },
]

export type BillingCycle = "monthly" | "annual"

export interface Plan {
  id: "starter" | "pro" | "enterprise"
  name: string
  description: string
  badge?: string
  price: Record<BillingCycle, string>
  subtext: Record<BillingCycle, string>
  // "Semua fitur X, plus:" line above the list.
  includesPrevious?: string
  features: string[]
  // Rendered below the list as an ℹ️ note rather than a ✅ feature.
  note?: string
  cta: string
  // "register" → the store registration page (a logged-in owner gets
  // `ownerCta` via sales instead, since upgrades go through the sales team);
  // "sales" → always a WhatsApp chat.
  ctaAction: "register" | "sales"
  ownerCta?: string
}

// Annual = monthly −20% (the toggle's "Hemat 20%"), same figures as the
// Stitch design.
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "14 HARI COBA GRATIS",
    description: "Untuk kedai kecil, booth, atau stand.",
    price: { monthly: MONTHLY_PRICE.starter, annual: "Rp79.000" },
    subtext: {
      monthly: "Gratis 14 hari, lalu bulanan flat",
      annual: "Ditagih tahunan · hemat Rp240.000",
    },
    features: [
      "1 outlet, 2 perangkat (1 kasir + 1 admin)",
      "Kasir offline-first penuh",
      "Menu & varian produk",
      "Nomor antrian (tanpa QR meja)",
      "Voucher & diskon otomatis",
      "Stok dasar & notifikasi stok menipis",
      "Shift & manajemen kas",
      "Laporan omset harian & bulanan",
      "Struk Bluetooth thermal",
      "Support WhatsApp",
    ],
    note: `Limit lunak ±${STARTER_SOFT_DAILY_LIMIT} transaksi/hari. Checkout tak pernah diblokir — notifikasi upgrade jika lewat 3 hari berturut.`,
    cta: "Mulai Uji Coba Gratis",
    ctaAction: "register",
    ownerCta: "Tanya Paket Starter",
  },
  {
    id: "pro",
    name: "Pro Dine-In",
    badge: "PALING POPULER UNTUK KAFE DINE-IN",
    description: "Untuk kafe dan resto dine-in yang ramai.",
    price: { monthly: MONTHLY_PRICE.pro, annual: "Rp144.000" },
    subtext: {
      monthly: "Fitur kasir resto lengkap",
      annual: "Ditagih tahunan · hemat Rp432.000",
    },
    includesPrevious: "Semua fitur Starter, plus:",
    features: [
      "Transaksi unlimited",
      "Hingga 3 perangkat kasir & waiter",
      "Self-order via QR meja",
      "Manajemen & status meja",
      "Split bill & pindah meja",
      "Stok penuh: opname, supplier & pembelian",
      "Laporan penjualan, kas & laba rugi (HPP otomatis)",
      "Analisa menu terlaris & margin",
      "Integrasi QRIS & e-wallet",
      "Support prioritas (< 3 menit)",
    ],
    cta: "Pilih Paket Pro Dine-In",
    ctaAction: "register",
    ownerCta: "Upgrade ke Pro Dine-In",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "MULTI-CABANG",
    description: "Untuk franchise dan multi-outlet.",
    price: { monthly: MONTHLY_PRICE.enterprise, annual: "Rp232.000" },
    subtext: {
      monthly: "+ Rp150.000/bln per outlet tambahan",
      annual: "+ Rp150.000/bln per outlet tambahan",
    },
    includesPrevious: "Semua fitur Pro, plus:",
    features: [
      "Dashboard multi-outlet terpusat",
      "Transfer stok antar cabang",
      "Role supervisor & otorisasi void",
      "Hak akses per modul",
      "Integrasi akuntansi via REST API",
      "Backup otomatis terjadwal",
      "Account manager & pelatihan onsite",
    ],
    cta: "Konsultasi Tim Enterprise",
    ctaAction: "sales",
  },
]

// The brief's fallback for the unconfirmed 30-day refund guarantee.
export const PRICING_FOOTNOTE = "Batalkan kapan saja. Tanpa kontrak."

export const FOOTER_TAGLINE =
  "Kasir cloud offline-first untuk UMKM kuliner Indonesia — tangguh tanpa sinyal, siap QRIS."

// Final CTA banner lead — the sign-up pitch only makes sense to visitors.
export const FINAL_CTA_LEAD = {
  visitor:
    "Daftar sekarang untuk gratis 14 hari penuh. Tim Neela bantu migrasi menu dan printer tanpa biaya tambahan.",
  owner:
    "Kelola menu, stok, dan laporan toko kamu dari dashboard owner. Butuh upgrade paket atau bantuan setup? Tim Neela siap membantu.",
}

// Footer: product/solution links point at the matching on-page section —
// the Stitch export had them as dead `href="#"` placeholders.
export const FOOTER_COLUMNS: { title: string; span: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produk",
    span: "lg:col-span-3",
    links: [
      { label: "Kasir Tablet & HP", href: "#fitur" },
      { label: "Meja & Dine-In", href: "#keunggulan" },
      { label: "Menu & Stok", href: "#harga" },
      { label: "Split Bill & QRIS", href: "#keunggulan" },
      { label: "Laporan Omset", href: "#keunggulan" },
    ],
  },
  {
    title: "Solusi",
    span: "lg:col-span-2",
    links: [
      { label: "Kedai Kopi & Kafe", href: "#harga" },
      { label: "Restoran Dine-in", href: "#harga" },
      { label: "Fast Food & Booth", href: "#harga" },
      { label: "Cloud Kitchen", href: "#harga" },
    ],
  },
]
