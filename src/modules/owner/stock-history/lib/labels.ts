// Tipe dan referensi pergerakan stok datang dari backend sebagai kode
// (mis. "SALE", "order"). Pemilik toko melihat padanan Indonesianya; kode yang
// belum dikenal ditampilkan sebagai teks biasa tanpa garis bawah, bukan kode mentah.
const TYPE_LABELS: Record<string, string> = {
  sale: "Penjualan",
  sales: "Penjualan",
  order: "Penjualan",
  adjustment: "Penyesuaian",
  adjust: "Penyesuaian",
  in: "Stok masuk",
  stock_in: "Stok masuk",
  purchase: "Pembelian",
  restock: "Stok masuk",
  out: "Stok keluar",
  stock_out: "Stok keluar",
  void: "Pesanan dibatalkan",
  refund: "Pengembalian",
  return: "Pengembalian",
  waste: "Terbuang / rusak",
  opname: "Stok opname",
  initial: "Stok awal",
}

const REFERENCE_LABELS: Record<string, string> = {
  order: "Pesanan",
  orders: "Pesanan",
  transaction: "Transaksi",
  purchase: "Pembelian",
  adjustment: "Penyesuaian",
  manual: "Manual",
  opname: "Stok opname",
}

function humanize(code: string): string {
  const text = code.replace(/[_-]+/g, " ").trim().toLowerCase()
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "—"
}

export function movementTypeLabel(type: string): string {
  return TYPE_LABELS[type.toLowerCase()] ?? humanize(type)
}

export function movementReferenceLabel(referenceType: string, referenceId?: number): string {
  if (!referenceType && !referenceId) return "—"
  const label = REFERENCE_LABELS[referenceType.toLowerCase()] ?? humanize(referenceType)
  return referenceId ? `${label} #${referenceId}` : label
}
