import { useEffect, useRef, useState } from "react"
import { CircleCheck, LoaderCircle, QrCode, RefreshCw, TriangleAlert } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import {
  isFinalPayment,
  paymentErrorMessage,
  useRegistrationPaymentQr,
  useRegistrationPaymentStatus,
} from "@/modules/public/store-registration/application/useRegistrationPayment"
import type {
  CheckRegistrationStatusPayload,
  PurchasablePlanCode,
  RegistrationPayment,
} from "@/modules/public/store-registration/domain/store-registration.types"
import { formatRupiah } from "@/shared/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary px-5 py-2.5 text-neela-label-md font-semibold text-neela-on-primary transition-colors hover:bg-neela-on-primary-fixed-variant disabled:cursor-not-allowed disabled:opacity-70"
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-neela-surface-container px-5 py-2.5 text-neela-label-md font-semibold text-neela-primary transition-colors hover:bg-neela-surface-container-high"

interface RegistrationPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The email + password chosen on the form: the backend's proof of ownership
  // for a registration that has no account yet. Held by the page, in memory.
  credentials: CheckRegistrationStatusPayload
  // Which plan is being bought (the code the backend prices) and its display name.
  plan: PurchasablePlanCode
  planName: string
  // Fired once when the payment is confirmed (status PAID).
  onPaid: () => void
}

// "Beli langsung" — Starter or Pro, 1 month, paid by QRIS (Midtrans Core API, so no
// Snap popup: the QR is drawn here and the status is polled). Opening it asks
// the backend for the QR; the backend hands back the still-valid one if the
// visitor closed and reopened the dialog, so this never double-charges.
export function RegistrationPaymentDialog({
  open,
  onOpenChange,
  credentials,
  plan,
  planName,
  onPaid,
}: RegistrationPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-neela sm:max-w-md">
        {/* Mounted only while open: every open starts by fetching the QR. */}
        {open && (
          <PaymentFlow
            credentials={credentials}
            plan={plan}
            planName={planName}
            onPaid={onPaid}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface PaymentFlowProps {
  credentials: CheckRegistrationStatusPayload
  plan: PurchasablePlanCode
  planName: string
  onPaid: () => void
  onClose: () => void
}

function PaymentFlow({ credentials, plan, planName, onPaid, onClose }: PaymentFlowProps) {
  const [now, setNow] = useState(() => Date.now())

  // Asked for once on open; "Buat QR baru" / "Coba lagi" bump the attempt.
  const [attempt, setAttempt] = useState(0)
  const qr = useRegistrationPaymentQr(credentials, plan, attempt)
  const requestQr = () => setAttempt((current) => current + 1)

  const created: RegistrationPayment | undefined = qr.data
  const poll = useRegistrationPaymentStatus(credentials, created?.payment_id)
  const payment = poll.data ?? created

  const expiresAt = payment?.expires_at ? new Date(payment.expires_at).getTime() : 0
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000))
  const paid = payment?.status === "PAID"
  // The backend reports a QR past its expiry as EXPIRED; the local clock
  // covers the gap until the next poll.
  const lapsed =
    payment != null && !paid && (isFinalPayment(payment) || (expiresAt > 0 && secondsLeft === 0))

  useEffect(() => {
    if (!payment || paid || lapsed) return
    setNow(Date.now()) // a fresh QR (first or re-created) starts from the real clock
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [payment?.payment_id, paid, lapsed]) // eslint-disable-line react-hooks/exhaustive-deps

  const notified = useRef(false)
  useEffect(() => {
    if (!paid || notified.current) return
    notified.current = true
    onPaid()
  }, [paid, onPaid])

  if (qr.isError && !payment) {
    return (
      <div className="flex flex-col gap-5">
        <DialogHeader>
          <DialogTitle className="text-neela-headline-sm text-neela-on-primary-fixed">
            Pembayaran belum bisa dimulai
          </DialogTitle>
          <DialogDescription>{paymentErrorMessage(qr.error)}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2.5">
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            Tutup
          </button>
          <button type="button" className={PRIMARY_BUTTON} onClick={requestQr}>
            <RefreshCw className="size-4" />
            Coba lagi
          </button>
        </div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
        <LoaderCircle className="size-8 animate-spin text-neela-primary" />
        <DialogTitle className="text-neela-headline-sm text-neela-on-primary-fixed">
          Menyiapkan QR pembayaran...
        </DialogTitle>
        <DialogDescription>Tunggu sebentar.</DialogDescription>
      </div>
    )
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-neela-tertiary-fixed text-neela-on-tertiary-fixed">
          <CircleCheck className="size-8" />
        </span>
        <DialogTitle className="text-neela-headline-md text-neela-on-primary-fixed">Pembayaran diterima</DialogTitle>
        <DialogDescription>
          Terima kasih! Paket {planName} 1 bulan sudah dibayar ({formatRupiah(payment.amount)}). Masa aktif dihitung
          mulai toko kamu disetujui tim Neela.
        </DialogDescription>
        <button type="button" className={`${PRIMARY_BUTTON} mt-2`} onClick={onClose}>
          Selesai
        </button>
      </div>
    )
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = String(secondsLeft % 60).padStart(2, "0")
  const qrValue = payment.qr_string || payment.qr_url

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="text-neela-headline-sm text-neela-on-primary-fixed">
          Bayar {planName} 1 Bulan
        </DialogTitle>
        <DialogDescription>
          Buka aplikasi e-wallet atau mobile banking yang mendukung <b>QRIS</b>, lalu pindai kode ini.
        </DialogDescription>
      </DialogHeader>

      <p className="text-center text-neela-headline-md font-bold text-neela-on-surface">{formatRupiah(payment.amount)}</p>

      <div className="relative mx-auto rounded-2xl border border-neela-surface-container-high bg-white p-4">
        {payment.qr_string ? (
          <QRCodeSVG value={payment.qr_string} size={232} level="M" aria-label="Kode QRIS pembayaran" />
        ) : qrValue ? (
          <img src={qrValue} alt="Kode QRIS pembayaran" className="size-[232px]" />
        ) : (
          <div className="flex size-[232px] items-center justify-center text-neela-outline">
            <QrCode className="size-12" />
          </div>
        )}
        {lapsed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/95 px-4 text-center">
            <TriangleAlert className="size-6 text-neela-error" />
            <p className="font-semibold text-neela-on-surface">
              {payment.status === "FAILED" || payment.status === "CANCELLED"
                ? "Pembayaran tidak berhasil"
                : "QR kedaluwarsa"}
            </p>
            <button type="button" className={PRIMARY_BUTTON} onClick={requestQr}>
              <RefreshCw className="size-4" />
              Buat QR baru
            </button>
          </div>
        )}
      </div>

      {!lapsed && (
        <div className="flex items-center justify-center gap-2 text-neela-body-md" role="status">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
          </span>
          <span className="text-neela-on-surface-variant">Menunggu pembayaran · berlaku</span>
          <span className="font-bold tabular-nums text-neela-on-surface">
            {minutes}:{seconds}
          </span>
        </div>
      )}

      <p className="text-center text-neela-body-sm text-neela-on-surface-variant">
        Halaman ini diperbarui otomatis setelah pembayaran terkonfirmasi. Kamu juga bisa menutupnya dan membayar nanti
        dari halaman pendaftaran.
      </p>

      <div className="flex justify-end">
        <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
          Tutup
        </button>
      </div>
    </div>
  )
}
