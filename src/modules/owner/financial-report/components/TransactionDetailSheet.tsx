import type { ReactNode } from "react"
import { format } from "date-fns"
import { InboxIcon, TriangleAlertIcon } from "lucide-react"

import type { OrderDetail, OrderDetailItem } from "@/entities/order/model/order-detail.types"
import type { OrderRefund } from "@/entities/refund/model/refund.types"
import { useOrderDetail, useOrderRefunds } from "@/modules/owner/financial-report/financial-report.queries"
import type { ReportTransaction } from "@/modules/owner/financial-report/financial-report.types"
import { orderStatusBadge } from "@/modules/owner/financial-report/lib/order-status"
import { formatPaymentLabel } from "@/modules/owner/financial-report/lib/payment-label"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"

interface TransactionDetailSheetProps {
  // The table row the owner opened — its status/refund figures are already
  // loaded; the item list, summary and payment are fetched here. null closes
  // the sheet (same open-state idiom as ShiftCashTransactionsSheet).
  order: ReportTransaction | null
  onClose: () => void
}

const ORDER_TYPE_LABEL: Record<string, string> = {
  dine_in: "Dine In",
  takeaway: "Takeaway",
  delivery: "Delivery",
}

function formatDateTime(value: string | null | undefined) {
  return value ? format(new Date(value), "d MMM yyyy, HH:mm") : "—"
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  )
}

function Row({
  label,
  children,
  strong,
  tone,
}: {
  label: ReactNode
  children: ReactNode
  strong?: boolean
  tone?: "refund"
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5 text-sm">
      <span className={cn("text-muted-foreground", strong && "font-semibold text-foreground")}>{label}</span>
      <span
        className={cn(
          "text-right tabular-nums",
          strong ? "font-bold text-foreground" : "font-medium text-foreground",
          tone === "refund" && "text-orange-600 dark:text-orange-400"
        )}
      >
        {children}
      </span>
    </div>
  )
}

// What was refunded for one order line, summed over every refund of the order
// (a line can be refunded in several steps), plus the latest reason/time.
interface ItemRefund {
  qty: number
  amount: number
  reason: string
  at: string
}

function refundsByItem(refunds: OrderRefund[]): Map<number, ItemRefund> {
  const map = new Map<number, ItemRefund>()
  for (const refund of refunds) {
    for (const item of refund.items) {
      const current = map.get(item.order_item_id)
      map.set(item.order_item_id, {
        qty: (current?.qty ?? 0) + item.qty,
        amount: (current?.amount ?? 0) + item.amount,
        reason: refund.reason || current?.reason || "",
        at: refund.created_at,
      })
    }
  }
  return map
}

function ItemRow({ item, refund }: { item: OrderDetailItem; refund: ItemRefund | undefined }) {
  const refundedQty = item.refunded_qty ?? 0
  const fullyRefunded = refundedQty >= item.qty
  const unitPrice = formatRupiah(item.price)

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-medium text-foreground", fullyRefunded && "text-muted-foreground line-through")}>
            {item.menu_name}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {item.qty} × {unitPrice}
          </p>
        </div>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums text-foreground",
            fullyRefunded && "text-muted-foreground line-through"
          )}
        >
          {formatRupiah(item.subtotal)}
        </span>
      </div>

      {item.addons?.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {item.addons.map((addon) => (
            <li key={addon.id} className="flex justify-between gap-3">
              <span>+ {addon.name}</span>
              {addon.price > 0 && <span className="tabular-nums">{formatRupiah(addon.price)}</span>}
            </li>
          ))}
        </ul>
      )}

      {item.notes && <p className="text-xs text-muted-foreground italic">Catatan: {item.notes}</p>}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {refundedQty > 0 ? (
          <>
            <Badge className="bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              Direfund {refundedQty} dari {item.qty}
            </Badge>
            {refund && (
              <span className="text-orange-600 tabular-nums dark:text-orange-400">
                -{formatRupiah(refund.amount)}
              </span>
            )}
          </>
        ) : (
          <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            Normal
          </Badge>
        )}
      </div>

      {refundedQty > 0 && refund && (refund.reason || refund.at) && (
        <p className="text-xs text-muted-foreground">
          {refund.reason ? `Alasan: ${refund.reason}` : null}
          {refund.reason && refund.at ? " · " : null}
          {refund.at ? formatDateTime(refund.at) : null}
        </p>
      )}
    </li>
  )
}

function PaymentBlock({ detail }: { detail: OrderDetail }) {
  const payment = detail.payment
  if (!payment) {
    return <p className="text-sm text-muted-foreground">Belum dibayar.</p>
  }
  const isCash = payment.payment_method_type === "cash"
  return (
    <div className="flex flex-col">
      <Row label="Metode">
        {formatPaymentLabel({
          type: payment.payment_method_type,
          name: payment.payment_method_name,
          channel: payment.payment_channel_name,
          cardType: payment.card_type,
          provider: payment.payment_provider,
        })}
      </Row>
      {payment.payment_reference && <Row label="Referensi / Approval">{payment.payment_reference}</Row>}
      {isCash && <Row label="Uang diterima">{formatRupiah(payment.amount_received)}</Row>}
      {isCash && <Row label="Kembalian">{formatRupiah(payment.change_amount)}</Row>}
      <Row label="Dibayar pada">{formatDateTime(payment.paid_at)}</Row>
    </div>
  )
}

function DetailBody({ detail, refunds }: { detail: OrderDetail; refunds: OrderRefund[] }) {
  const itemRefunds = refundsByItem(refunds)
  const refundTotal = refunds.reduce((sum, refund) => sum + refund.total_amount, 0)
  const refundItemsValue = refunds.reduce(
    (sum, refund) => sum + refund.items.reduce((inner, item) => inner + item.amount, 0),
    0
  )
  const refundTax = Math.max(0, refundTotal - refundItemsValue)
  const netTotal = Math.max(0, detail.summary.grand_total - refundTotal)

  return (
    <div className="flex flex-col gap-6">
      <Section title="Pesanan">
        <div className="flex flex-col">
          <Row label="No. Transaksi">{detail.trx_no || "—"}</Row>
          <Row label="Tipe">
            {ORDER_TYPE_LABEL[detail.order_type] ?? detail.order_type ?? "—"}
            {detail.order_type === "dine_in" && detail.table_number ? ` · Meja ${detail.table_number}` : ""}
          </Row>
          <Row label="Pelanggan">{detail.guest_name || "—"}</Row>
          {detail.notes && <Row label="Catatan">{detail.notes}</Row>}
          {detail.cancel_reason && <Row label="Alasan batal">{detail.cancel_reason}</Row>}
        </div>
      </Section>

      <Section title={`Item (${detail.items.length})`}>
        <ul className="flex flex-col gap-2">
          {detail.items.map((item) => (
            <ItemRow key={item.id} item={item} refund={itemRefunds.get(item.id)} />
          ))}
        </ul>
      </Section>

      <Section title="Ringkasan Pembayaran">
        <div className="flex flex-col">
          <Row label="Subtotal Produk">{formatRupiah(detail.summary.subtotal)}</Row>
          {detail.summary.discount_amount > 0 && (
            <Row label="Diskon / Voucher">- {formatRupiah(detail.summary.discount_amount)}</Row>
          )}
          {detail.summary.tax_amount > 0 && (
            <Row label={`Pajak (${Math.round(detail.summary.tax_percent * 100) / 100}%)`}>
              {formatRupiah(detail.summary.tax_amount)}
            </Row>
          )}
          <Row label="Total">{formatRupiah(detail.summary.grand_total)}</Row>
          {refundTotal > 0 && (
            <Row label="Subtotal Refund" tone="refund">
              - {formatRupiah(refundTotal)}
            </Row>
          )}
          {refundTax > 0 && (
            <p className="text-right text-xs text-muted-foreground">
              termasuk pajak {formatRupiah(refundTax)}
            </p>
          )}
          <div className="mt-1 border-t pt-1.5">
            <Row label="Total Bersih Dibayarkan" strong>
              {formatRupiah(refundTotal > 0 ? netTotal : detail.summary.grand_total)}
            </Row>
          </div>
        </div>
      </Section>

      <Section title="Pembayaran">
        <PaymentBlock detail={detail} />
      </Section>

      {refunds.length > 0 && (
        <Section title={`Riwayat Refund (${refunds.length})`}>
          <ul className="flex flex-col gap-2">
            {refunds.map((refund) => (
              <li key={refund.id} className="flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">
                    {refund.refund_no}{" "}
                    <span className="font-normal text-muted-foreground">
                      · {refund.type === "full" ? "Penuh" : "Sebagian"}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                    - {formatRupiah(refund.total_amount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(refund.created_at)}
                  {refund.reason ? ` · Alasan: ${refund.reason}` : ""}
                </p>
                <ul className="text-xs text-muted-foreground">
                  {refund.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span>
                        {item.menu_name} × {item.qty}
                      </span>
                      <span className="tabular-nums">{formatRupiah(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

// Row-click drill-down for one transaction (TransactionsTab): items with
// modifiers/notes and what was refunded per item, the payment summary with the
// net amount, and the payment method down to its provider/bank. Follows
// ShiftCashTransactionsSheet's read-only Sheet pattern.
export function TransactionDetailSheet({ order, onClose }: TransactionDetailSheetProps) {
  const orderId = order?.order_id ?? null
  const detailQuery = useOrderDetail(orderId)
  const refundsQuery = useOrderRefunds(orderId)

  const isLoading = detailQuery.isLoading || refundsQuery.isLoading
  const isError = detailQuery.isError || refundsQuery.isError
  const status = order ? orderStatusBadge(order.status, order.refund_status) : null

  return (
    <Sheet open={order !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-xl">
        {order && status && (
          <>
            <SheetHeader>
              <SheetTitle className="flex flex-wrap items-center gap-2">
                {order.order_no}
                <Badge className={cn("w-fit", status.className)}>{status.label}</Badge>
              </SheetTitle>
              <SheetDescription>
                {formatDateTime(order.created_at)} · Kasir {order.cashier_name || "—"}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto border-t px-6 py-5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-lg bg-muted/40" />
                ))
              ) : isError || !detailQuery.data ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <TriangleAlertIcon className="size-5" />
                  </span>
                  <p className="font-semibold text-foreground">Gagal memuat detail transaksi</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Rincian item dan pembayaran untuk transaksi ini tidak dapat dimuat.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={() => {
                      void detailQuery.refetch()
                      void refundsQuery.refetch()
                    }}
                  >
                    Coba lagi
                  </Button>
                </div>
              ) : detailQuery.data.items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <InboxIcon className="size-5" />
                  </span>
                  <p className="font-semibold text-foreground">Tidak ada item</p>
                </div>
              ) : (
                <DetailBody detail={detailQuery.data} refunds={refundsQuery.data ?? []} />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
