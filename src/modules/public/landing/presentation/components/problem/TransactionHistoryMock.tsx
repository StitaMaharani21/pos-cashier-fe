import { useState } from "react"

import { rp } from "@/modules/public/landing/presentation/components/problem/format"
import { Chip, MockCard, MockHead, MockHint, MockTitle } from "@/modules/public/landing/presentation/components/problem/mock-ui"
import { cn } from "@/shared/lib/utils"

type Method = "tunai" | "qris"
type Filter = "all" | Method

const TRANSACTIONS: { id: string; time: string; cashier: string; method: Method; amount: number }[] = [
  { id: "#0418", time: "14:32", cashier: "Dewi", method: "qris", amount: 68000 },
  { id: "#0417", time: "14:21", cashier: "Rizky", method: "tunai", amount: 45000 },
  { id: "#0416", time: "14:05", cashier: "Dewi", method: "tunai", amount: 32500 },
  { id: "#0415", time: "13:48", cashier: "Sari", method: "qris", amount: 91000 },
  { id: "#0414", time: "13:30", cashier: "Rizky", method: "qris", amount: 27000 },
]

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "tunai", label: "Tunai" },
  { id: "qris", label: "QRIS" },
]

const AVATAR_TONES: Record<string, string> = {
  Dewi: "bg-neela-blue-100 text-neela-blue-700",
  Rizky: "bg-neela-neutral-100 text-neela-neutral-600",
  Sari: "bg-neela-brand text-white",
}

const sum = (list: typeof TRANSACTIONS) => list.reduce((total, t) => total + t.amount, 0)

// Product mock for "catatan berantakan": the owner-side transaction history
// with cashier, payment-method chip and amount per row. The filter dims
// non-matching rows (rather than removing them) so the card never changes height.
export function TransactionHistoryMock() {
  const [filter, setFilter] = useState<Filter>("all")
  const matches = TRANSACTIONS.filter((t) => filter === "all" || t.method === filter)
  const cash = sum(TRANSACTIONS.filter((t) => t.method === "tunai"))
  const qris = sum(TRANSACTIONS.filter((t) => t.method === "qris"))

  return (
    <div className="flex w-full flex-col items-center gap-3.5">
      <MockCard>
        <MockHead className="flex-wrap">
          <MockTitle title="Riwayat transaksi" subtitle="Akun pemilik · Hari ini" />
          <div role="group" aria-label="Filter metode bayar" className="flex gap-1.5">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "min-h-8 cursor-pointer rounded-full px-3 text-neela-label-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neela-brand",
                  filter === option.id
                    ? "bg-neela-text text-white"
                    : "bg-neela-surface-alt text-neela-text-secondary hover:bg-neela-blue-100/60"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </MockHead>

        <ul>
          {TRANSACTIONS.map((t) => (
            <li
              key={t.id}
              className={cn(
                "grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-t border-neela-border px-3.5 py-2.5 transition-opacity duration-300 first:border-t-0",
                filter !== "all" && t.method !== filter && "opacity-30"
              )}
            >
              <span
                className={cn(
                  "flex size-8.5 items-center justify-center rounded-full text-neela-label-md font-extrabold",
                  AVATAR_TONES[t.cashier]
                )}
                aria-hidden
              >
                {t.cashier[0]}
              </span>
              <div className="min-w-0">
                <p className="font-bold">{t.cashier}</p>
                <p className="text-neela-body-sm font-medium text-neela-text-muted">
                  {t.time} · {t.id}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-bold tabular-nums">{rp(t.amount)}</span>
                <Chip tone={t.method === "qris" ? "blue" : "slate"}>{t.method === "qris" ? "QRIS" : "Tunai"}</Chip>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t border-neela-border bg-neela-surface-subtle px-3.5 py-3">
          <div>
            <p className="font-bold">{matches.length} transaksi</p>
            <p className="text-neela-body-sm font-medium text-neela-text-muted">
              {filter === "all"
                ? `Tunai ${rp(cash)} · QRIS ${rp(qris)}`
                : `Hanya pembayaran ${filter === "tunai" ? "tunai" : "QRIS"}`}
            </p>
          </div>
          <p className="text-neela-label-lg font-bold tabular-nums">{rp(sum(matches))}</p>
        </div>
      </MockCard>
      <MockHint>Coba filter berdasarkan metode bayar.</MockHint>
    </div>
  )
}
