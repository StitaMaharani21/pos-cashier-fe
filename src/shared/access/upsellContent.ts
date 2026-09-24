import type { Feature, UpgradeHint } from "./types"

export const featureCopy: Partial<Record<Feature, { title: string; description: string }>> = {
  reports: {
    title: "Laporan Lengkap",
    description:
      "Laporan penjualan, kas, dan untung rugi dengan filter periode, kasir, dan metode bayar.",
  },
  inventory_full: {
    title: "Inventori Lengkap",
    description:
      "Kelola bahan baku dan resep, lihat riwayat pergerakan stok, dan cek selisih stok.",
  },
  qr_self_order: {
    title: "QR Self-Order per Meja",
    description:
      "Pelanggan memesan sendiri lewat QR di meja, pesanan langsung masuk ke kasir.",
  },
  multi_outlet: {
    title: "Multi Outlet",
    description: "Kelola beberapa outlet dalam satu akun, dengan laporan gabungan.",
  },
  custom_rbac: {
    title: "Hak Akses Kustom",
    description: "Atur peran dan izin akses secara detail untuk tiap anggota tim.",
  },
}

export const hintCopy: Record<UpgradeHint, { badge: string; cta: string }> = {
  ADDON: { badge: "Tersedia sebagai Add-on", cta: "Tambah Add-on" },
  UPGRADE_PRO: { badge: "Tersedia di Paket Pro", cta: "Upgrade ke Pro" },
  UPGRADE_ENTERPRISE: { badge: "Tersedia di Paket Enterprise", cta: "Hubungi Kami" },
}

// pos-kasir-be has no self-serve checkout for plan/addon changes — upgrades
// go through Neela's sales team, so the CTA opens a prefilled WhatsApp chat
// instead of a payment flow.
export function contactLink(feature: Feature, hint: UpgradeHint, storeName?: string) {
  const salesWa = import.meta.env.VITE_SALES_WA as string | undefined
  const title = featureCopy[feature]?.title ?? feature
  const text = `Halo Neela, saya ingin ${hintCopy[hint].cta.toLowerCase()} untuk fitur ${title}${
    storeName ? ` di toko ${storeName}` : ""
  }.`
  return salesWa ? `https://wa.me/${salesWa}?text=${encodeURIComponent(text)}` : undefined
}
