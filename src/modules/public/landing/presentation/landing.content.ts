import {
  Armchair,
  BadgeCheck,
  BanknoteIcon,
  ChartColumn,
  CreditCard,
  Headset,
  type LucideIcon,
  Lock,
  Monitor,
  MessageSquarePlus,
  PackageSearch,
  QrCode,
  Receipt,
  Smartphone,
  Timer,
  Wallet,
  WifiOff,
} from "lucide-react"

import orderScreen from "@/assets/landing/order-screen.webp"
import payCash from "@/assets/landing/pay-cash.webp"
import payQris from "@/assets/landing/pay-qris.webp"
import shiftStart from "@/assets/landing/shift-start.webp"
import { REGISTER_PATH, SUPPORT_HOURS } from "@/modules/public/shared/contact"
import { EXTRA_PRICING, MONTHLY_PRICE, PRICE_PREFIX, STARTER_SOFT_DAILY_LIMIT } from "@/modules/public/shared/pricing"

// All landing copy in one place. Static marketing content: pos-kasir-be has
// no CMS/promotion backend (see ARCHITECTURE.md), so editing the page means
// editing this file.
//
// Content is grounded against three sources of truth so nothing here claims
// more than the product does:
// - pos-kasir-be's internal/entitlement/feature.go (Starter vs Pro feature
//   gate — POS/Shift/Discount vs +Reports/+Inventory/+QRSelfOrder/+OnlinePayment)
// - pos-kasir-be's internal/common/plan/plan.go (cashier/device limits)
// - docs/proses-bisnis-landing-page.md (the landing page's business rules —
//   registration/approval flow, subscription timing, what must never be
//   promised)
//
// The page is in "early access" mode while Neela has no live customers yet:
// no customer logos, no testimonials. Filling in SOCIAL_PROOF / TESTIMONIALS
// below switches EarlyAccessSection to real social proof — only with real,
// owner-approved content.

// ---------------------------------------------------------------------------
// Primary conversion actions

// Visitors go to registration; a logged-in owner gets a way back into the
// console instead — never a "sign up" prompt for someone who already has a
// store (components/PrimaryCta.tsx).
export const PRIMARY_CTA = {
  visitor: { label: "Daftar", to: REGISTER_PATH },
  owner: { label: "Buka Dashboard", to: "/app" },
} as const

export const WHATSAPP_CTA_LABEL = "Konsultasi via WhatsApp"

export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#harga", label: "Paket Harga" },
  { href: "#faq", label: "FAQ" },
]

// ---------------------------------------------------------------------------
// Hero (section 2)

export const HERO_HEADLINE = "Kasir tetap berjalan saat internet putus."
export const HERO_SUBHEAD =
  "Neela POS mencatat pesanan tunai dan mengelola shift kasir walau WiFi mati. Begitu internet kembali, data langsung terkirim — tanpa kamu harus input ulang."

export const HERO_BADGE = "Dibuat untuk kafe, resto & kedai di Indonesia"

// ---------------------------------------------------------------------------
// Quick product facts (section 3) — platform/payment/printing facts a
// visitor needs before reading further. Kept factual, no marketing adjectives.

export interface QuickFact {
  icon: LucideIcon
  label: string
  body: string
}

export const QUICK_FACTS: QuickFact[] = [
  {
    icon: Smartphone,
    label: "Android & Windows",
    body: "Kasir berjalan di tablet/HP Android dan di PC/laptop Windows.",
  },
  {
    icon: Receipt,
    label: "Cetak struk Bluetooth & USB",
    body: "Tersedia di Android. Printer di Windows memakai jalur cetak Windows sendiri.",
  },
  {
    icon: WifiOff,
    label: "Offline: tunai & shift",
    body: "Pesanan tunai, buka/tutup shift, dan hitung kas tetap jalan tanpa internet.",
  },
  {
    icon: QrCode,
    label: "QRIS & nontunai perlu internet",
    body: "Pembayaran QRIS, kartu, dan transfer butuh koneksi internet aktif.",
  },
]

// ---------------------------------------------------------------------------
// Problems → solutions (section 4) — three concrete operational problems,
// each answered by a real, shipped capability (not a promised outcome).

// `visual` picks the product mock drawn inside the solution card
// (ProblemSection); `kicker` is the feature name on that card.
export interface ProblemSolution {
  problem: string
  solution: string
  explanation: string
}

export const PROBLEMS: ProblemSolution[] = [
  {
    problem: "Internet putus, kasir berhenti",
    solution: "Pesanan tunai dan shift tetap jalan tanpa internet",
    explanation: "Data tersimpan di perangkat dan terkirim otomatis saat internet kembali.",
  },
  {
    problem: "Catatan transaksi berantakan",
    solution: "Setiap transaksi tercatat rapi di satu tempat",
    explanation: "Riwayat pesanan, metode bayar, dan shift bisa dicek kapan saja dari akun owner.",
  },
  {
    problem: "Kas dan stok sering tidak cocok",
    solution: "Hitung kas per shift, cek selisih stok per bahan",
    explanation: "Selisih kas langsung terlihat saat tutup shift. Stok per bahan baku tersedia di paket Pro.",
  },
]

// ---------------------------------------------------------------------------
// Product tour (section 5) — real screens where a screenshot exists;
// a plain description where it doesn't (never a fabricated mockup).

export interface TourStep {
  title: string
  body: string
  badge?: "Pro"
}

export const TOUR_CASHIER: TourStep & { image: string; imageAlt: string } = {
  title: "Pilih menu, buat pesanan",
  body: "Katalog menu dan panel pesanan dalam satu layar. Kasir menambah item, mencatat catatan khusus, dan menerapkan diskon dalam hitungan detik.",
  image: orderScreen,
  imageAlt: "Layar Buat Pesanan Neela POS: katalog menu di kiri, panel pesanan di kanan",
}

export const TOUR_PAYMENT: TourStep & { images: { src: string; alt: string }[] } = {
  title: "Bayar tunai atau QRIS",
  body: "Tunai dicatat dengan kembalian otomatis. QRIS menampilkan kode pembayaran langsung di layar kasir — keduanya tercatat sebagai satu transaksi yang sama.",
  images: [
    { src: payCash, alt: "Modal pembayaran tunai: jumlah diterima dan kembalian dihitung otomatis" },
    { src: payQris, alt: "Modal pembayaran QRIS dengan kode QR toko" },
  ],
}

export const TOUR_SHIFT: TourStep & { image: string; imageAlt: string } = {
  title: "Buka shift, hitung kas",
  body: "Kasir mencatat saldo kas awal saat buka shift, lalu menghitung uang fisik saat tutup shift. Sistem menunjukkan selisihnya, kalau ada.",
  image: shiftStart,
  imageAlt: "Layar Mulai Shift: kasir memasukkan saldo kas awal",
}

// No screenshot asset exists for these yet — described plainly rather than
// faked. Each maps to a real, shipped screen in the owner console.
export const TOUR_OTHER: TourStep[] = [
  {
    title: "Riwayat transaksi",
    body: "Setiap pesanan, metode bayar, dan kasir yang menangani tersimpan dan bisa dicari dari dashboard owner.",
  },
  {
    title: "Laporan penjualan & kas",
    body: "Rekap omset, metode pembayaran, dan arus kas per shift — dilihat dari dashboard, kapan saja.",
    badge: "Pro",
  },
  {
    title: "Stok per bahan & resep",
    body: "Catat bahan baku per resep menu, pantau stok menipis, dan cek selisih stok fisik terhadap sistem.",
    badge: "Pro",
  },
]

// ---------------------------------------------------------------------------
// Offline explanation (section 6) — the central differentiator, explained
// honestly: what keeps working, what needs a connection.

export const OFFLINE_WORKS: { icon: LucideIcon; label: string }[] = [
  { icon: Receipt, label: "Pesanan & pembayaran tunai" },
  { icon: Timer, label: "Buka dan tutup shift" },
  { icon: BanknoteIcon, label: "Hitung kas di laci" },
]

export const OFFLINE_NEEDS_INTERNET: { icon: LucideIcon; label: string }[] = [
  { icon: QrCode, label: "Pembayaran QRIS" },
  { icon: CreditCard, label: "Pembayaran kartu" },
  { icon: Wallet, label: "Transfer bank" },
]

export const OFFLINE_NOTE =
  "Neela POS tidak berjalan sepenuhnya offline — fitur di luar pesanan tunai dan shift (termasuk sinkronisasi laporan ke server) butuh internet begitu tersedia lagi."

// ---------------------------------------------------------------------------
// Features & supported devices (section 7)

export interface FeatureItem {
  icon: LucideIcon
  label: string
}

// Starter, per entitlement.go's starterFeatures(): POS, Shift, Discount.
export const STARTER_FEATURES: FeatureItem[] = [
  { icon: Receipt, label: "Kasir: pesanan, keranjang, bayar" },
  { icon: Timer, label: "Manajemen shift & hitung kas" },
  { icon: BadgeCheck, label: "Voucher & diskon" },
  { icon: WifiOff, label: "Offline untuk pesanan tunai" },
]

// Pro-exclusive, per entitlement.go's proFeatures() beyond Starter: Reports,
// Inventory, QRSelfOrder, OnlinePayment (+ table management, gated on the
// same qr_self_order feature flag — see app/router/routeAccess.ts).
export const PRO_FEATURES: FeatureItem[] = [
  { icon: ChartColumn, label: "Laporan penjualan & kas" },
  { icon: PackageSearch, label: "Stok per bahan baku & resep" },
  { icon: QrCode, label: "Self-order QR pelanggan" },
  { icon: Armchair, label: "Kelola meja" },
  { icon: Wallet, label: "QRIS dinamis (pembayaran online)" },
]

export const PLATFORM_FACTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Smartphone,
    title: "Android",
    body: "Kasir lengkap di tablet atau HP. Cetak struk lewat printer Bluetooth atau USB.",
  },
  {
    icon: Monitor,
    title: "Windows",
    body: "Kasir lengkap di PC atau laptop, dengan jalur cetak struk Windows sendiri.",
  },
]

// ---------------------------------------------------------------------------
// Self-order QR (section 8) — Pro upsell reason.

export const SELF_ORDER = {
  eyebrow: "Fitur Pro",
  title: "Pelanggan pesan sendiri lewat QR di meja",
  body: "Pelanggan memindai kode QR di meja, melihat menu, dan memesan langsung dari HP mereka — pesanan masuk ke kasir tanpa perlu dicatat ulang. Mengurangi antrean di jam sibuk dan membebaskan kasir untuk fokus menyiapkan pesanan.",
  bullets: [
    "Satu kode QR per meja, dicetak dari dashboard",
    "Pesanan masuk langsung ke layar kasir",
    "Jadi satu paket dengan Kelola Meja di paket Pro",
  ],
} as const

// ---------------------------------------------------------------------------
// Pricing (section 9) — numbers from shared/pricing.ts (the single source of
// truth, kept in sync with pos-kasir-be's subscription_plan table per that
// file's own header comment). Limits below are cross-checked against
// pos-kasir-be's internal/common/plan/plan.go.

export type PlanId = "starter" | "pro" | "enterprise"

export interface Plan {
  id: PlanId
  name: string
  description: string
  pricePrefix?: string
  price: string
  cashiers: string
  devices: string
  includesPrevious?: string
  features: string[]
  note?: string
  cta: string
  ctaAction: "register" | "sales"
  ownerCta?: string
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Untuk kedai kecil atau booth dengan satu kasir.",
    pricePrefix: PRICE_PREFIX.starter,
    price: MONTHLY_PRICE.starter,
    cashiers: "1 kasir",
    devices: "2 perangkat",
    features: [
      "Kasir lengkap: pesanan, keranjang, bayar",
      "Manajemen shift & hitung kas",
      "Voucher & diskon",
      "Offline untuk pesanan tunai",
    ],
    note: `Sekitar ${STARTER_SOFT_DAILY_LIMIT} transaksi/hari sebagai acuan kapasitas paket ini.`,
    cta: "Daftar Starter",
    ctaAction: "register",
    ownerCta: "Tanya Paket Starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Untuk kafe & resto dine-in yang butuh laporan dan stok.",
    pricePrefix: PRICE_PREFIX.pro,
    price: MONTHLY_PRICE.pro,
    cashiers: "2 kasir",
    devices: "4 perangkat",
    includesPrevious: "Semua fitur Starter, plus:",
    features: [
      "Laporan penjualan & kas",
      "Stok per bahan baku & resep",
      "Self-order QR pelanggan",
      "Kelola meja",
      "QRIS dinamis (pembayaran online)",
    ],
    cta: "Daftar Pro",
    ctaAction: "register",
    ownerCta: "Naik ke Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Untuk kebutuhan kasir dalam jumlah besar.",
    pricePrefix: PRICE_PREFIX.enterprise,
    price: MONTHLY_PRICE.enterprise,
    cashiers: "5 kasir",
    devices: "Perangkat tanpa batas",
    includesPrevious: "Semua fitur Pro, plus:",
    features: ["Penawaran disesuaikan lewat tim sales"],
    cta: "Konsultasi Enterprise",
    ctaAction: "sales",
  },
]

export const EXTRA_DEVICE_NOTE = `Perangkat tambahan ${EXTRA_PRICING.extraDevice.price}${EXTRA_PRICING.extraDevice.unit} — berlaku untuk Starter dan Pro.`

export const PRICING_TERMS = "Harga per toko per bulan, belum termasuk PPN."

// ---------------------------------------------------------------------------
// Social proof — empty until there's something real to show (see
// EarlyAccessSection / TestimonialSection).

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

// ---------------------------------------------------------------------------
// Early access program (section 10) — stands in for testimonials; no
// customer names, logos, or numbers until there's something real to cite.

export const EARLY_ACCESS = {
  eyebrow: "Program Early Access",
  title: "Belum ada pelanggan yang bisa kami kutip — jadi kami jujur saja",
  description:
    "Neela POS masih di tahap awal. Daripada testimoni yang belum ada, berikut yang kamu dapat kalau bergabung sekarang.",
} as const

export const EARLY_ACCESS_PERKS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Headset,
    title: "Dibantu setup dari awal",
    body: "Tim kami bantu input menu dan menyiapkan printer sampai toko siap jualan.",
  },
  {
    icon: MessageSquarePlus,
    title: "Masukanmu menentukan prioritas",
    body: "Permintaan fitur dari toko early access masuk ke antrean pengembangan lebih dulu.",
  },
  {
    icon: Lock,
    title: "Dukungan WhatsApp",
    body: `Tim support bisa dihubungi lewat WhatsApp, ${SUPPORT_HOURS}.`,
  },
]

// ---------------------------------------------------------------------------
// FAQ (section 11) — only answers backed by the implementation or the
// business rules in docs/proses-bisnis-landing-page.md.

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apa yang terjadi kalau internet putus?",
    answer:
      "Pesanan tunai dan manajemen shift (buka/tutup shift, hitung kas) tetap berjalan di perangkat kasir. Pembayaran QRIS, kartu, dan transfer butuh internet aktif karena diproses lewat penyedia pembayaran. Data yang tersimpan selama offline terkirim otomatis begitu internet kembali.",
  },
  {
    question: "Platform dan perangkat apa saja yang didukung?",
    answer:
      "Android (tablet atau HP) dan Windows (PC atau laptop). Cetak struk lewat printer Bluetooth atau USB tersedia di Android; Windows memakai jalur cetak Windows sendiri.",
  },
  {
    question: "Fitur apa saja yang khusus paket Pro?",
    answer:
      "Laporan penjualan & kas, stok per bahan baku & resep, self-order QR untuk pelanggan, kelola meja, dan QRIS dinamis (pembayaran online langsung dari toko). Semua fitur Starter tetap ada di Pro.",
  },
  {
    question: "Berapa kasir dan perangkat yang didapat per paket?",
    answer:
      "Starter: 1 kasir, 2 perangkat. Pro: 2 kasir, 4 perangkat. Enterprise: 5 kasir, perangkat tanpa batas. Perangkat tambahan di luar kuota bisa ditambah dengan biaya per bulan per perangkat.",
  },
  {
    question: "Bagaimana proses pendaftaran dan persetujuannya?",
    answer:
      "Setiap toko baru yang mendaftar diperiksa dan disetujui dulu oleh tim admin sebelum aktif. Kamu bisa mengecek status pendaftaran kapan saja dengan email dan kata sandi yang didaftarkan.",
  },
  {
    question: "Kapan masa langganan mulai dihitung?",
    answer:
      "Masa langganan 30 hari dihitung sejak toko disetujui admin, bukan sejak pembayaran dilakukan. Perpanjangan juga memakai siklus 30 hari.",
  },
  {
    question: "Bagaimana pembayaran QRIS dan perpanjangan langganan bekerja?",
    answer:
      "Starter dan Pro dibayar lewat QRIS. Naik paket tidak menghitung sisa hari paket lama (mulai periode baru), dan turun paket saat ini belum didukung.",
  },
  {
    question: "Bagaimana cara minta penawaran Enterprise?",
    answer: `Hubungi tim sales lewat WhatsApp (${SUPPORT_HOURS}). Paket Enterprise disesuaikan dengan kebutuhan toko dan tidak dibeli sendiri lewat halaman ini.`,
  },
]

// ---------------------------------------------------------------------------
// Closing CTA (section 12)

export const FINAL_CTA_LEAD = {
  visitor: "Daftar sekarang, atau ngobrol dulu dengan tim kami lewat WhatsApp kalau masih ada yang ingin ditanyakan.",
  owner: "Butuh pindah paket atau bantuan menyiapkan toko? Tim Neela siap membantu lewat WhatsApp.",
} as const

export const FINAL_CTA_TITLE = "Siap kasir yang tidak takut internet putus?"

// ---------------------------------------------------------------------------
// Footer (section 13)

export const FOOTER_TAGLINE = "Aplikasi kasir untuk kafe, resto & kedai di Indonesia — tetap jalan tanpa internet untuk pesanan tunai."

// Legal entity name, office address, privacy policy and terms of service are
// not settled yet (no such pages exist in this repo) — reported as a launch
// dependency rather than fabricated. See the implementation report.
export const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "#fitur" },
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Paket Harga", href: "#harga" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Status Pendaftaran", href: "/status-pendaftaran" },
    ],
  },
]
