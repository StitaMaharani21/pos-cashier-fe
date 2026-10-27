// Tipe dan referensi pergerakan stok datang dari backend sebagai kode
// (mis. "OUT" + "ORDER"). Pemilik toko melihat padanan Indonesianya; kode yang
// belum dikenal ditampilkan sebagai teks biasa tanpa garis bawah, bukan kode mentah.

export type MovementTone = "in" | "out" | "neutral"

export interface MovementKind {
  label: string
  tone: MovementTone
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

function toneOf(delta: number): MovementTone {
  if (delta > 0) return "in"
  if (delta < 0) return "out"
  return "neutral"
}

// What a movement is, for the "Jenis" badge. `delta` is the signed change
// (positive = stock in). The backend uses "IN" both for goods received
// (reference PURCHASE) and for stock restored when an order is cancelled
// (reference ORDER) — the reference tells them apart.
export function movementKind(type: string, referenceType: string, delta: number): MovementKind {
  const kind = type.toLowerCase()
  const reference = referenceType.toLowerCase()

  if (kind === "in") {
    if (reference === "purchase") return { label: "Stok masuk", tone: "in" }
    if (reference === "order") return { label: "Pembatalan pesanan", tone: "in" }
    return { label: "Stok masuk", tone: "in" }
  }
  if (kind === "out") {
    return { label: reference === "order" ? "Penjualan" : "Stok keluar", tone: "out" }
  }
  if (kind === "adjustment") {
    if (delta > 0) return { label: "Penyesuaian (+)", tone: "in" }
    if (delta < 0) return { label: "Penyesuaian (−)", tone: "out" }
    return { label: "Penyesuaian", tone: "neutral" }
  }
  return { label: humanize(type), tone: toneOf(delta) }
}

export function movementReferenceLabel(referenceType: string, referenceId?: number): string {
  if (!referenceType && !referenceId) return "—"
  const label = REFERENCE_LABELS[referenceType.toLowerCase()] ?? humanize(referenceType)
  return referenceId ? `${label} #${referenceId}` : label
}
