import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CircleCheckIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import type { SubscriptionPayment } from "@/entities/subscription/model/subscription.types"
import {
  SUBSCRIPTION_KEY,
  createAddonPayment,
  createPlanPayment,
  getPayment,
  paymentErrorMessage,
} from "@/modules/owner/billing/api/subscription.service"
import {
  intentDays,
  intentEstimate,
  intentNotes,
  intentTitle,
  type PaymentIntent,
} from "@/modules/owner/billing/lib/payment-intent"
import { CAPABILITIES_QUERY_KEY } from "@/shared/access/queryKeys"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

// How often the open dialog asks whether the QR was paid.
const POLL_MS = 3000
// pos-kasir-be caches the store's plan/entitlements for 60 s, so what a
// payment unlocks can lag a little behind the webhook; capabilities are read
// again right away and once more after the cache has certainly lapsed.
const ENTITLEMENT_RECHECK_MS = 65_000

const FINAL_STATUSES = ["PAID", "FAILED", "EXPIRED", "CANCELLED"]

interface PaymentQrDialogProps {
  // null = closed.
  intent: PaymentIntent | null
  onOpenChange: (open: boolean) => void
}

// Buy a plan or an add-on with QRIS (Midtrans Core API): confirm what is being
// bought (with the no-proration warning for upgrades) → QR → the payment is
// polled until PAID → the page's data and the owner's capabilities refresh.
export function PaymentQrDialog({ intent, onOpenChange }: PaymentQrDialogProps) {
  return (
    <Dialog open={intent != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Mounted only while open: every open starts at the confirm step. */}
        {intent && <PaymentFlow intent={intent} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function PaymentFlow({ intent, onClose }: { intent: PaymentIntent; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => Date.now())

  const create = useMutation({
    mutationFn: (): Promise<SubscriptionPayment> =>
      intent.kind === "plan"
        ? createPlanPayment(intent.plan.plan_id)
        : createAddonPayment(intent.addon.code, intent.addon.per_unit ? intent.qty : 1),
    onSuccess: () => setNow(Date.now()),
  })
  const created = create.data

  const poll = useQuery({
    queryKey: [...SUBSCRIPTION_KEY, "payment", created?.payment_id],
    queryFn: () => getPayment(created?.payment_id as number),
    enabled: created != null,
    refetchInterval: (query) => (FINAL_STATUSES.includes(query.state.data?.status ?? "") ? false : POLL_MS),
    // Paying happens in a bank/e-wallet app; keep checking from this tab.
    refetchIntervalInBackground: true,
    gcTime: 0,
  })
  const payment = poll.data ?? created

  const expiresAt = payment?.expires_at ? new Date(payment.expires_at).getTime() : 0
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  const paid = payment?.status === "PAID"
  const lapsed = payment != null && !paid && (FINAL_STATUSES.includes(payment.status) || (expiresAt > 0 && secondsLeft === 0))

  useEffect(() => {
    if (!payment || paid || lapsed) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [payment?.payment_id, paid, lapsed]) // eslint-disable-line react-hooks/exhaustive-deps

  const refreshed = useRef(false)
  useEffect(() => {
    if (!paid || refreshed.current) return
    refreshed.current = true
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: CAPABILITIES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY })
      queryClient.invalidateQueries({ queryKey: ["devices"] })
    }
    refresh()
    // Not tied to this component: the dialog may be closed by then.
    setTimeout(refresh, ENTITLEMENT_RECHECK_MS)
  }, [paid, queryClient])

  const title = intentTitle(intent)

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CircleCheckIcon className="size-7" />
        </span>
        <DialogTitle className="text-xl font-bold">Pembayaran diterima</DialogTitle>
        <DialogDescription>
          {title} ({formatRupiah(payment?.amount ?? 0)}) sudah dibayar. Perubahan paket dan fitur bisa butuh sekitar satu menit
          untuk aktif sepenuhnya.
        </DialogDescription>
        <Button className="mt-2" onClick={onClose}>
          Selesai
        </Button>
      </div>
    )
  }

  // Step 1 — confirm what is bought, then ask the backend for the QR.
  if (!payment) {
    return (
      <div className="flex flex-col gap-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>Periksa dulu, lalu bayar dengan QRIS (semua e-wallet &amp; mobile banking).</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-2xl font-extrabold tabular-nums">{formatRupiah(intentEstimate(intent))}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {intentDays(intent)} hari · harga per toko, belum termasuk PPN (jika berlaku)
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {intentNotes(intent).map((note) => (
            <li
              key={note}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
              <span>{note}</span>
            </li>
          ))}
        </ul>

        {create.isError && (
          <p role="alert" className="text-sm text-destructive">
            {paymentErrorMessage(create.error)}
          </p>
        )}

        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" disabled={create.isPending} onClick={() => create.mutate()}>
            {create.isPending ? "Membuat QR..." : `Bayar ${formatRupiah(intentEstimate(intent))}`}
          </Button>
        </div>
      </div>
    )
  }

  // Step 2 — the QR (or its expired state).
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, "0")

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Scan untuk membayar</DialogTitle>
        <DialogDescription>
          {title} · buka e-wallet atau mobile banking yang mendukung QRIS, lalu pindai kode ini.
        </DialogDescription>
      </DialogHeader>

      <div className="relative mx-auto rounded-2xl border bg-white p-4">
        <QRCodeSVG value={payment.qr_string ?? ""} size={232} level="M" aria-label="QR pembayaran QRIS" />
        {lapsed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 text-center">
            <p className="font-semibold text-foreground">QR kedaluwarsa</p>
            <Button
              size="sm"
              disabled={create.isPending}
              onClick={() => create.mutate()}
            >
              <RefreshCwIcon />
              Buat QR baru
            </Button>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-2xl font-extrabold tabular-nums">{formatRupiah(payment.amount)}</p>
        {!lapsed && (
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
            Menunggu pembayaran · berlaku
            <span className="font-bold tabular-nums text-foreground">
              {minutes}:{seconds}
            </span>
          </p>
        )}
      </div>

      {create.isError && (
        <p role="alert" className="text-center text-sm text-destructive">
          {paymentErrorMessage(create.error)}
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Halaman ini diperbarui otomatis setelah pembayaran terkonfirmasi. Anda juga bisa menutupnya; fitur aktif begitu
        pembayaran diterima.
      </p>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </div>
  )
}
