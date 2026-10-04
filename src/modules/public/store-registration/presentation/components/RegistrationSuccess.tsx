import { CircleCheck, MessageCircle, QrCode } from "lucide-react"
import { Link } from "react-router-dom"

import { REGISTRATION_STATUS_PATH, waLink } from "@/modules/public/shared/contact"

interface RegistrationSuccessProps {
  email: string
  storeName: string
  // Set when the visitor chose "Beli Langsung": whether the QRIS payment was
  // confirmed yet, and how to reopen the payment dialog if they closed it.
  purchase?: { planName: string; paid: boolean; onPay: () => void }
}

// Submitting doesn't create the store yet — pos-kasir-be queues it as
// "pending" for an internal admin to approve (which then provisions it).
// So this says "we'll review it", not "your store is ready" — even when the
// first month is already paid: payment doesn't skip the review.
export function RegistrationSuccess({ email, storeName, purchase }: RegistrationSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
      <div className="flex size-16 items-center justify-center rounded-full bg-neela-tertiary-fixed text-neela-on-tertiary-fixed">
        <CircleCheck className="size-9" />
      </div>
      <h2 className="text-neela-headline-md text-neela-on-primary-fixed">Pendaftaran Terkirim!</h2>
      {purchase &&
        (purchase.paid ? (
          <p className="max-w-md rounded-xl bg-neela-tertiary-fixed px-4 py-3 text-neela-body-md text-neela-on-tertiary-fixed">
            Pembayaran paket {purchase.planName} 1 bulan sudah kami terima. Masa aktif dihitung mulai toko
            disetujui.
          </p>
        ) : (
          <div className="flex max-w-md flex-col items-center gap-3 rounded-xl bg-neela-primary-fixed/50 px-4 py-3 text-neela-on-primary-fixed-variant">
            <p className="text-neela-body-md">
              Pembayaran paket {purchase.planName} 1 bulan belum selesai. Pendaftaran kamu sudah tercatat —
              selesaikan pembayarannya kapan saja selagi halaman ini terbuka.
            </p>
            <button
              type="button"
              onClick={purchase.onPay}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary px-5 py-2.5 text-neela-label-md font-semibold text-neela-on-primary transition-colors hover:bg-neela-on-primary-fixed-variant"
            >
              <QrCode className="size-4" />
              Bayar Sekarang
            </button>
          </div>
        ))}
      <p className="max-w-md text-neela-body-md text-neela-on-surface-variant">
        Terima kasih, pendaftaran <strong className="text-neela-on-surface">{storeName}</strong> sudah
        kami terima dan sedang ditinjau tim Neela. Setelah disetujui, kamu bisa masuk ke portal dengan
        email <strong className="text-neela-on-surface">{email}</strong> dan kata sandi yang baru kamu
        buat.
      </p>
      <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:w-auto sm:flex-row">
        {/* Email goes in router state, not the URL (no personal data in query strings). */}
        <Link
          to={REGISTRATION_STATUS_PATH}
          state={{ email }}
          className="inline-flex items-center justify-center rounded-xl bg-neela-primary px-6 py-3 text-neela-label-md font-semibold text-neela-on-primary transition-colors hover:bg-neela-on-primary-fixed-variant"
        >
          Cek Status Pendaftaran
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl bg-neela-surface-container px-6 py-3 text-neela-label-md font-semibold text-neela-primary transition-colors hover:bg-neela-surface-container-high"
        >
          Kembali ke Beranda
        </Link>
        <a
          href={waLink(`Halo Neela POS, saya baru mendaftarkan toko "${storeName}" (${email})`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-surface-container px-6 py-3 text-neela-label-md font-semibold text-neela-primary transition-colors hover:bg-neela-surface-container-high"
        >
          <MessageCircle className="size-4" />
          Konfirmasi via WhatsApp
        </a>
      </div>
    </div>
  )
}
