import { CircleCheck, MessageCircle } from "lucide-react"
import { Link } from "react-router-dom"

import { waLink } from "@/modules/public/shared/contact"

interface RegistrationSuccessProps {
  email: string
  storeName: string
}

// Submitting doesn't create the store yet — pos-kasir-be queues it as
// "pending" for an internal admin to approve (which then provisions it).
// So this says "we'll review it", not "your store is ready".
export function RegistrationSuccess({ email, storeName }: RegistrationSuccessProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center" role="status">
      <div className="flex size-16 items-center justify-center rounded-full bg-neela-tertiary-fixed text-neela-on-tertiary-fixed">
        <CircleCheck className="size-9" />
      </div>
      <h2 className="text-neela-headline-md text-neela-on-primary-fixed">Pendaftaran Terkirim!</h2>
      <p className="max-w-md text-neela-body-md text-neela-on-surface-variant">
        Terima kasih, pendaftaran <strong className="text-neela-on-surface">{storeName}</strong> sudah
        kami terima dan sedang ditinjau tim Neela. Setelah disetujui, kamu bisa masuk ke portal dengan
        email <strong className="text-neela-on-surface">{email}</strong> dan kata sandi yang baru kamu
        buat.
      </p>
      <div className="flex w-full flex-col items-stretch gap-3 pt-2 sm:w-auto sm:flex-row">
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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary px-6 py-3 text-neela-label-md font-semibold text-neela-on-primary transition-colors hover:bg-neela-on-primary-fixed-variant"
        >
          <MessageCircle className="size-4" />
          Konfirmasi via WhatsApp
        </a>
      </div>
    </div>
  )
}
