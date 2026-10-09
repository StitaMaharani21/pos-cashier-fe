import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { CircleCheck, CircleX, Clock, MessageCircle } from "lucide-react"
import { Link } from "react-router-dom"

import { REGISTER_PATH, waLink } from "@/modules/public/shared/contact"
import type {
  CheckRegistrationStatusResponse,
  RegistrationStatus,
} from "@/modules/public/store-registration/domain/store-registration.types"
import { cn } from "@/shared/lib/utils"

interface RegistrationStatusResultProps {
  result: CheckRegistrationStatusResponse
  email: string
  isRefreshing: boolean
  onRefresh: () => void
  onCheckOther: () => void
}

const STATUS_VIEW: Record<
  RegistrationStatus,
  { title: string; badge: string; icon: typeof Clock; tone: string }
> = {
  pending: {
    title: "Sedang Ditinjau",
    badge: "Menunggu persetujuan",
    icon: Clock,
    tone: "bg-neela-primary-fixed text-neela-on-primary-fixed",
  },
  approved: {
    title: "Pendaftaran Disetujui",
    badge: "Disetujui",
    icon: CircleCheck,
    tone: "bg-neela-tertiary-fixed text-neela-on-tertiary-fixed",
  },
  rejected: {
    title: "Pendaftaran Ditolak",
    badge: "Ditolak",
    icon: CircleX,
    tone: "bg-neela-error-container text-neela-on-error-container",
  },
}

function formatDate(iso: string): string {
  return format(new Date(iso), "d MMMM yyyy, HH:mm", { locale: localeId })
}

const linkSecondary =
  "inline-flex items-center justify-center rounded-xl bg-neela-surface-container px-6 py-3 text-neela-label-md font-semibold text-neela-primary transition-colors hover:bg-neela-surface-container-high"
const linkPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-neela-primary px-6 py-3 text-neela-label-md font-semibold text-neela-on-primary transition-colors hover:bg-neela-on-primary-fixed-variant"

// One step of the "Terkirim → Ditinjau → Hasil" trail. `state` drives the dot.
function Step({ label, detail, state }: { label: string; detail?: string; state: "done" | "current" | "todo" | "failed" }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-1 size-3 shrink-0 rounded-full",
          state === "done" && "bg-neela-tertiary",
          state === "current" && "bg-neela-primary ring-4 ring-neela-primary-fixed",
          state === "todo" && "bg-neela-outline-variant",
          state === "failed" && "bg-neela-error"
        )}
      />
      <div>
        <p className={cn("text-neela-label-md", state === "todo" ? "text-neela-outline" : "text-neela-on-surface")}>
          {label}
        </p>
        {detail && <p className="text-neela-body-sm text-neela-on-surface-variant">{detail}</p>}
      </div>
    </li>
  )
}

// The three outcomes of pos-kasir-be's store_registration.status. Approved
// means an admin accepted it and tenant provisioning was kicked off (async),
// so the login may need a few minutes before it works.
export function RegistrationStatusResult({
  result,
  email,
  isRefreshing,
  onRefresh,
  onCheckOther,
}: RegistrationStatusResultProps) {
  const view = STATUS_VIEW[result.status]
  const Icon = view.icon
  const processedAt = result.processed_at ? formatDate(result.processed_at) : undefined

  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={cn("flex size-16 items-center justify-center rounded-full", view.tone)}>
          <Icon className="size-9" />
        </div>
        <span className={cn("rounded-full px-3 py-1 text-neela-label-sm font-bold tracking-wider uppercase", view.tone)}>
          {view.badge}
        </span>
        <h2 className="text-neela-headline-md text-neela-on-primary-fixed">{view.title}</h2>
        <p className="max-w-md text-neela-body-md text-neela-on-surface-variant">
          {result.status === "pending" && (
            <>
              Pendaftaran <strong className="text-neela-on-surface">{result.store_name}</strong> sudah kami
              terima dan sedang ditinjau tim Neela. Toko baru dibuat setelah disetujui.
            </>
          )}
          {result.status === "approved" && (
            <>
              Toko <strong className="text-neela-on-surface">{result.store_name}</strong> sudah disetujui dan
              sedang disiapkan. Masuk dengan email{" "}
              <strong className="text-neela-on-surface">{email}</strong> dan kata sandi yang kamu buat. Jika
              belum bisa masuk, tunggu beberapa menit lalu coba lagi.
            </>
          )}
          {result.status === "rejected" && (
            <>
              Maaf, pendaftaran <strong className="text-neela-on-surface">{result.store_name}</strong> belum
              dapat kami setujui. Kamu bisa mendaftar ulang dengan data yang sudah diperbaiki.
            </>
          )}
        </p>
      </div>

      {result.status === "rejected" && result.rejection_reason && (
        <div className="rounded-xl bg-neela-error-container/50 p-4">
          <p className="text-neela-label-sm font-bold tracking-wider text-neela-on-error-container uppercase">
            Alasan penolakan
          </p>
          <p className="mt-1 text-neela-body-md text-neela-on-surface">{result.rejection_reason}</p>
        </div>
      )}

      <ol className="flex flex-col gap-4 rounded-xl bg-neela-surface-container-low/60 p-4">
        <Step label="Pendaftaran terkirim" detail={formatDate(result.created_at)} state="done" />
        <Step label="Ditinjau tim Neela" state={result.status === "pending" ? "current" : "done"} />
        {result.status === "rejected" ? (
          <Step label="Ditolak" detail={processedAt} state="failed" />
        ) : (
          <Step
            label={result.status === "approved" ? "Disetujui — toko sedang disiapkan" : "Disetujui & toko aktif"}
            detail={processedAt}
            state={result.status === "approved" ? "done" : "todo"}
          />
        )}
      </ol>

      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
        {result.status === "approved" && (
          <Link to="/login" className={linkPrimary}>
            Masuk ke Akun
          </Link>
        )}
        {result.status === "rejected" && (
          <Link to={REGISTER_PATH} className={linkPrimary}>
            Daftar Ulang
          </Link>
        )}
        {result.status === "pending" && (
          <button type="button" onClick={onRefresh} disabled={isRefreshing} className={cn(linkPrimary, "disabled:opacity-70")}>
            {isRefreshing ? "Memeriksa..." : "Perbarui Status"}
          </button>
        )}
        <a
          href={waLink(`Halo Neela POS, saya ingin menanyakan pendaftaran toko "${result.store_name}" (${email})`)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(linkSecondary, "gap-2")}
        >
          <MessageCircle className="size-4" />
          Hubungi Tim Neela
        </a>
      </div>

      <button
        type="button"
        onClick={onCheckOther}
        className="mx-auto text-neela-label-md font-semibold text-neela-primary hover:underline"
      >
        Cek pendaftaran lain
      </button>
    </div>
  )
}
