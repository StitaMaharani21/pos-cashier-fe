import type { Feature, UpgradeHint } from "./types"

export const featureCopy: Partial<Record<Feature, { title: string; description: string }>> = {
  reports: {
    title: "Laporan Lengkap",
    description:
      "Laporan penjualan, kas, dan untung rugi. Bisa dilihat per periode, kasir, dan cara bayar.",
  },
  inventory_full: {
    title: "Inventori Lengkap",
    description:
      "Kelola bahan baku dan resep, lihat riwayat keluar masuk stok, dan cek selisih stok.",
  },
  qr_self_order: {
    title: "Pesan dari Meja (QR)",
    description:
      "Pelanggan memesan sendiri dengan memindai QR di meja, pesanan langsung masuk ke kasir.",
  },
  online_payment: {
    title: "Pembayaran Online (Midtrans)",
    description: "Terima pembayaran QRIS pelanggan langsung ke akun Midtrans toko Anda.",
  },
  multi_outlet: {
    title: "Banyak Cabang",
    description: "Kelola beberapa cabang dalam satu akun, lengkap dengan laporan gabungan.",
  },
  custom_rbac: {
    title: "Atur Hak Akses Tim",
    description: "Tentukan sendiri apa saja yang boleh dibuka dan diubah oleh tiap anggota tim.",
  },
}

export const hintCopy: Record<UpgradeHint, { badge: string; cta: string }> = {
  ADDON: { badge: "Tersedia sebagai fitur tambahan", cta: "Tambah Fitur" },
  UPGRADE_PRO: { badge: "Tersedia di Paket Pro", cta: "Naik ke Paket Pro" },
  UPGRADE_ENTERPRISE: { badge: "Tersedia di Paket Enterprise", cta: "Hubungi Kami" },
}

// pos-kasir-be has no self-serve checkout for plan/addon changes — upgrades
// go through Neela's sales team, so the CTA opens a prefilled WhatsApp chat
// instead of a payment flow.
export function contactLink(feature: Feature, _hint: UpgradeHint, storeName?: string) {
  const salesWa = import.meta.env.VITE_SALES_WA as string | undefined
  const title = featureCopy[feature]?.title ?? feature
  const text = `Halo Neela, saya tertarik memakai fitur ${title}${
    storeName ? ` di toko ${storeName}` : ""
  }. Mohon info caranya.`
  return salesWa ? `https://wa.me/${salesWa}?text=${encodeURIComponent(text)}` : undefined
}
