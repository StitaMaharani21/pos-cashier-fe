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
import {
  ANNUAL_BILLING_ENABLED,
  ANNUAL_PRICE,
  EXTRA_PRICING,
  MONTHLY_PRICE,
  PRICE_PREFIX,
  STARTER_SOFT_DAILY_LIMIT,
} from "@/modules/public/shared/pricing"

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
    "Bergabung dalam gelombang pertama kafe & resto yang beralih ke sistem kasir yang tetap jalan tanpa internet",
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
    title: "Batas Transaksi Mendadak",
    body: "Kafe sedang ramai, kasir malah terkunci dan dipaksa pindah paket.",
    impact: "Antrean macet, omset hangus.",
  },
  {
    icon: WifiOff,
    title: "WiFi Mati, Kasir Lumpuh",
    body: "Kasir yang butuh internet berhenti saat WiFi putus. Pesanan dicatat di kertas.",
    impact: "Order salah, tamu komplain.",
  },
  {
    icon: Wallet,
    title: "Biaya Tersembunyi & Bantuan Lambat",
    body: "Tambah printer atau kasir, tambah biaya. Tim bantuan baru membalas berhari-hari.",
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
    body: "Struk dan tiket dapur tetap tercetak. Data terkirim otomatis begitu internet kembali.",
    tags: ["Tanpa Internet", "Tanpa Jeda"],
    highlightTag: "Data Terkirim Otomatis",
  },
  {
    icon: InfinityIcon,
    iconClassName: "bg-neela-tertiary-fixed text-neela-tertiary",
    taglineClassName: "text-neela-tertiary",
    title: "Checkout Tak Pernah Diblokir",
    tagline: "Batas harian Starter cuma pengingat, bukan pemblokir.",
    body: "Lewat batas beberapa hari? Kami kirim pemberitahuan untuk pindah paket — kasir tetap jalan.",
    tags: ["Kelonggaran 3 Hari"],
    highlightTag: "Biaya Tetap",
  },
  {
    icon: MessageCircle,
    iconClassName: "bg-neela-secondary-fixed text-neela-on-secondary-fixed",
    taglineClassName: "text-neela-secondary",
    title: "Bantuan dari Tim Lokal",
    tagline: `WhatsApp ${SUPPORT_HOURS}.`,
    body: "Tim Jakarta yang paham kafe & resto — dari menyiapkan menu sampai mengatasi kendala.",
    tags: ["Onboarding Dipandu"],
    highlightTag: "Tim Jabodetabek",
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
    body: "Laporan harian dan pemberitahuan stok menipis, langsung di HP.",
  },
]

export type BillingCycle = "monthly" | "annual"

export interface Plan {
  id: "starter" | "pro" | "enterprise"
  name: string
  description: string
  badge?: string
  // "Mulai " for a price that is only a starting point (Enterprise quote).
  pricePrefix?: string
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

// Annual = pay 10 months, use 12 (price list). The annual price is a yearly
// total, so PricingSection swaps the "/ outlet / bln" unit for "/ tahun".
// Feature lists follow the "Price List POS Kasir — Asta Studio" comparison table.
export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "14 HARI COBA GRATIS",
    description: "Untuk kedai kecil, booth, atau stand.",
    pricePrefix: PRICE_PREFIX.starter,
    price: { monthly: MONTHLY_PRICE.starter, annual: ANNUAL_PRICE.starter },
    subtext: {
      monthly: "Gratis 14 hari, lalu bulanan flat",
      annual: "Bayar 10 bulan, pakai 12 bulan",
    },
    features: [
      "1 outlet, 2 perangkat (1 kasir + 1 admin)",
      "Kasir lengkap, tetap jalan tanpa internet",
      "Order, keranjang & bayar tunai/digital",
      "Menu, kategori & metode pembayaran",
      "Dashboard kasir, shift & pengelolaan kas",
      "Ringkasan penjualan dasar",
      "Cetak struk lewat printer Bluetooth",
      "Nomor antrian sederhana",
      "Support WhatsApp",
    ],
    note: `Batas sekitar ${STARTER_SOFT_DAILY_LIMIT} transaksi per hari. Kasir tidak pernah diblokir — pembatasan baru berlaku jika batas terlewati 3 hari berturut-turut. Opsional: transaksi di atas batas ${EXTRA_PRICING.overage.price}${EXTRA_PRICING.overage.unit}, ditagih akhir bulan.`,
    cta: "Mulai Uji Coba Gratis",
    ctaAction: "register",
    ownerCta: "Tanya Paket Starter",
  },
  {
    id: "pro",
    name: "Pro Dine-In",
    badge: "PALING POPULER UNTUK KAFE DINE-IN",
    description: "Untuk kafe dan resto dine-in yang ramai.",
    pricePrefix: PRICE_PREFIX.pro,
    price: { monthly: MONTHLY_PRICE.pro, annual: ANNUAL_PRICE.pro },
    subtext: {
      monthly: "Fitur kasir resto lengkap",
      annual: "Bayar 10 bulan, pakai 12 bulan",
    },
    includesPrevious: "Semua fitur Starter, plus:",
    features: [
      "Sampai 3 outlet, 4 perangkat",
      "Transaksi tanpa batas",
      "Pelanggan pesan sendiri lewat QR di meja & antrian digital",
      "Manajemen & status meja",
      "Split bill & pindah meja",
      "Voucher & diskon otomatis per produk",
      "Stok lengkap: barang masuk/keluar, cek stok fisik, supplier & pembelian",
      "Pemberitahuan stok hampir habis",
      "Laporan penjualan, kas & untung rugi (modal per menu dihitung otomatis)",
      "Menu terlaris & keuntungan per menu",
      "Integrasi QRIS & e-wallet",
    ],
    note: `Perangkat tambahan ${EXTRA_PRICING.extraDevice.price}${EXTRA_PRICING.extraDevice.unit}.`,
    cta: "Pilih Paket Pro Dine-In",
    ctaAction: "register",
    ownerCta: "Naik ke Pro Dine-In",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "MULTI-CABANG",
    description: "Untuk franchise dan multi-outlet.",
    pricePrefix: PRICE_PREFIX.enterprise,
    price: { monthly: MONTHLY_PRICE.enterprise, annual: ANNUAL_PRICE.enterprise },
    subtext: {
      monthly: "Custom quote sesuai jumlah cabang",
      annual: "Bayar 10 bulan, pakai 12 bulan · custom quote",
    },
    includesPrevious: "Semua fitur Pro, plus:",
    features: [
      "Cabang tanpa batas, jumlah perangkat sesuai kesepakatan",
      "Dashboard gabungan semua cabang",
      "Transfer stok antar cabang",
      "Peran supervisor & persetujuan pembatalan pesanan",
      "Hak akses diatur per bagian aplikasi",
      "Terhubung ke software akuntansi",
      "Cadangan data otomatis terjadwal",
      "Support prioritas & onboarding khusus",
    ],
    cta: "Konsultasi Tim Enterprise",
    ctaAction: "sales",
  },
]

// Shown under the plan cards. Terms come from the price list's "Ketentuan".
export const PRICING_TERMS = ANNUAL_BILLING_ENABLED
  ? "Harga per toko, belum termasuk PPN (jika berlaku). Tagihan tahunan = bayar 10 bulan untuk pemakaian 12 bulan."
  : "Harga per toko, belum termasuk PPN (jika berlaku)."

// The brief's fallback for the unconfirmed 30-day refund guarantee.
export const PRICING_FOOTNOTE = "Batalkan kapan saja. Tanpa kontrak."

export const FOOTER_TAGLINE =
  "Aplikasi kasir untuk UMKM kuliner Indonesia — tetap jalan tanpa sinyal, siap QRIS."

// Final CTA banner lead — the sign-up pitch only makes sense to visitors.
export const FINAL_CTA_LEAD = {
  visitor:
    "Daftar sekarang untuk gratis 14 hari penuh. Tim Neela bantu migrasi menu dan printer tanpa biaya tambahan.",
  owner:
    "Kelola menu, stok, dan laporan toko kamu dari dashboard. Butuh pindah paket atau bantuan menyiapkan toko? Tim Neela siap membantu.",
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
