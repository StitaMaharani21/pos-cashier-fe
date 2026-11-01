// Harga pokok (HPP) rata-rata tertimbang bahan baku — rumus yang sama dengan
// pos-kasir-be (internal/master/ingredient WeightedAverageCost), dipakai di sini
// hanya untuk pratinjau sebelum stok masuk disimpan:
//
//   rata-rata baru = (stok lama × rata-rata lama + jumlah masuk × harga masuk)
//                    ÷ (stok lama + jumlah masuk)
//
// Stok kosong atau minus tidak ikut dihitung (rata-rata mulai lagi dari harga
// masuk). Rata-rata lama 0 (belum pernah dihitung) memakai harga beli terakhir.
export function nextAverageCost({
  stockBefore,
  average,
  fallback,
  qty,
  price,
}: {
  stockBefore: number
  average: number
  fallback: number
  qty: number
  price: number
}): number {
  if (stockBefore <= 0 || qty <= 0) return price
  const base = average === 0 ? fallback : average
  return (stockBefore * base + qty * price) / (stockBefore + qty)
}
