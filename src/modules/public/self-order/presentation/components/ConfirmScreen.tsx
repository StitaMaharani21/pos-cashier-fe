import { BanIcon, CheckIcon, ClockIcon } from "lucide-react"

import type { GuestCartItem, GuestOrder } from "@/modules/public/self-order/domain/self-order.types"
import { groupCartItems } from "@/modules/public/self-order/presentation/self-order-helpers"
import { formatRupiah } from "@/shared/lib/utils"

interface ConfirmScreenProps {
  tableNumber: string
  order: GuestOrder
  // What was sent — the cart's lines, kept by the app because checking out
  // empties the live cart.
  items: GuestCartItem[]
  onNewOrder: () => void
}

// Where the cashier is with the order, from the order's status.
const PROGRESS = ["Dikirim", "Diproses", "Selesai"] as const

function progressOf(status: string): number {
  if (status === "diproses") return 2
  if (status === "selesai") return 3
  return 1
}

export function ConfirmScreen({ tableNumber, order, items, onNewOrder }: ConfirmScreenProps) {
  const rejected = order.status === "dibatalkan"
  const step = progressOf(order.status)
  const groups = groupCartItems(items)

  const heading = rejected
    ? "Pesanan tidak dapat diproses"
    : order.status === "selesai"
      ? "Pesanan selesai"
      : order.status === "diproses"
        ? "Pesanan sedang diproses"
        : "Pesanan terkirim"
  const body = rejected
    ? "Kasir membatalkan pesanan ini. Silakan hubungi staff untuk bantuan."
    : order.status === "pending"
      ? `Pesanan meja ${tableNumber} sudah diteruskan dan menunggu konfirmasi kasir.`
      : order.status === "selesai"
        ? `Pesanan meja ${tableNumber} sudah selesai. Selamat menikmati!`
        : `Kasir sudah menerima pesanan meja ${tableNumber}.`

  return (
    <div className="so-confirm" aria-live="polite">
      <div className={`so-stamp${rejected ? " rejected" : ""}`}>
        {rejected ? <BanIcon aria-hidden /> : <CheckIcon aria-hidden />}
      </div>
      <h2>{heading}</h2>
      <p>{body}</p>

      {!rejected && (
        <div className="so-steps" aria-label="Status pesanan">
          {PROGRESS.map((label, index) => (
            <div key={label} className={`so-step${index < step ? " done" : ""}`}>
              {label}
            </div>
          ))}
        </div>
      )}

      <div className="so-confirm-card">
        <div className="so-cline">
          <span>No. pesanan</span>
          <b>{order.order_no}</b>
        </div>
        {groups.map((group) => (
          <div key={group.label} className="so-cline">
            <span>
              {group.label} · {group.qty} item
            </span>
            <b>{formatRupiah(group.subtotal)}</b>
          </div>
        ))}
        <div className="so-cline total">
          <span>Total</span>
          <b>{formatRupiah(order.grand_total)}</b>
        </div>
      </div>

      {!rejected && (
        <div className="so-confirm-note">
          <ClockIcon aria-hidden />
          <span>
            Pembayaran dilakukan langsung di kasir. Tunjukkan nomor meja <b>{tableNumber}</b> saat membayar.
          </span>
        </div>
      )}

      <button type="button" className="so-ghost" onClick={onNewOrder}>
        Pesan lagi
      </button>
    </div>
  )
}
