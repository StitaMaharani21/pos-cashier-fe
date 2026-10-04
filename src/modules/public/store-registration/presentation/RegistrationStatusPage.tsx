import { useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { toast } from "sonner"

import {
  isStatusCheckRejected,
  useCheckRegistrationStatus,
} from "@/modules/public/store-registration/application/useSubmitRegistration"
import {
  EMPTY_STATUS_FORM,
  registrationStatusSchema,
  toStatusPayload,
  type RegistrationStatusFormValues,
} from "@/modules/public/store-registration/domain/registration-status.schema"
import type {
  CheckRegistrationStatusPayload,
  CheckRegistrationStatusResponse,
} from "@/modules/public/store-registration/domain/store-registration.types"
import {
  RegistrationFooter,
  RegistrationHeader,
} from "@/modules/public/store-registration/presentation/components/RegistrationChrome"
import { RegistrationStatusForm } from "@/modules/public/store-registration/presentation/components/RegistrationStatusForm"
import { RegistrationStatusResult } from "@/modules/public/store-registration/presentation/components/RegistrationStatusResult"
import { REGISTER_PATH } from "@/modules/public/shared/contact"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"
import { ApiError, NetworkError } from "@/shared/api/client"
import { useCrudForm } from "@/shared/hooks/useCrudForm"

// Public "Status Pendaftaran" screen (/status-pendaftaran). Submitting the
// registration form only queues a `pending` request that an internal admin
// (Neela Control) approves or rejects, and the owner has no account — so no
// login — until then. This lets them see where it stands, proving ownership
// with the email + password they registered with.
export function RegistrationStatusPage() {
  const isOwner = useIsOwnerSession()
  const location = useLocation()
  const mutation = useCheckRegistrationStatus()
  // Kept in memory only (never in the URL or storage) so "Perbarui Status"
  // can re-run the lookup without asking for the password again. Held here
  // rather than read off the mutation, which clears its data while a refresh
  // is in flight (that would flash the form back).
  const [checked, setChecked] = useState<{
    payload: CheckRegistrationStatusPayload
    result: CheckRegistrationStatusResponse
  } | null>(null)

  // RegistrationSuccess links here with the email in router state (not the
  // URL — keep personal data out of query strings).
  const stateEmail = (location.state as { email?: string } | null)?.email
  const form = useCrudForm<RegistrationStatusFormValues>({
    schema: registrationStatusSchema,
    defaultValues: { ...EMPTY_STATUS_FORM, email: stateEmail ?? "" },
  })

  // An owner who's already logged in has an approved store.
  if (isOwner) return <Navigate to="/app" replace />

  function lookup(payload: CheckRegistrationStatusPayload) {
    mutation.mutate(payload, {
      onSuccess: (result) => setChecked({ payload, result }),
      onError: (error) => {
        if (isStatusCheckRejected(error)) {
          form.setError("password", {
            message: "Email atau kata sandi tidak cocok dengan pendaftaran mana pun.",
          })
          return
        }
        if (error instanceof NetworkError) {
          toast.error("Tidak dapat terhubung ke server. Coba lagi beberapa saat.")
          return
        }
        toast.error(
          error instanceof ApiError ? error.message : "Status pendaftaran gagal diperiksa. Coba lagi."
        )
      },
    })
  }

  function reset() {
    mutation.reset()
    setChecked(null)
    form.reset({ ...EMPTY_STATUS_FORM, email: form.getValues("email") })
  }

  return (
    <div className="flex min-h-screen flex-col bg-neela-surface font-neela text-neela-body-md text-neela-on-surface antialiased">
      <RegistrationHeader />

      <main className="relative w-full flex-1 overflow-hidden pt-16">
        <div className="pointer-events-none absolute -top-36 -left-36 size-96 rounded-full bg-neela-primary-fixed opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-32 size-80 rounded-full bg-neela-tertiary-fixed opacity-30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-xl px-4 py-8 md:px-6 lg:py-16">
          <div className="mb-8 text-center">
            <h1 className="text-neela-headline-xl-mobile tracking-tight text-neela-on-primary-fixed md:text-neela-headline-xl">
              Status Pendaftaran Toko
            </h1>
            <p className="mt-1 text-neela-body-lg text-neela-on-surface-variant">
              Cek apakah pembuatan tokomu sudah disetujui tim Neela.
            </p>
          </div>

          <div className="rounded-2xl bg-neela-surface-container-lowest p-4 shadow-md sm:p-8">
            {checked ? (
              <RegistrationStatusResult
                result={checked.result}
                email={checked.payload.email}
                isRefreshing={mutation.isPending}
                onRefresh={() => lookup(checked.payload)}
                onCheckOther={reset}
              />
            ) : (
              <RegistrationStatusForm
                form={form}
                isSubmitting={mutation.isPending}
                onSubmit={(values) => lookup(toStatusPayload(values))}
              />
            )}
          </div>

          {!checked && (
            <p className="mt-6 text-center text-neela-body-md text-neela-on-surface-variant">
              Belum mendaftar?{" "}
              <Link to={REGISTER_PATH} className="text-neela-label-md font-semibold text-neela-primary hover:underline">
                Daftarkan toko
              </Link>
            </p>
          )}
        </div>
      </main>

      <RegistrationFooter />
    </div>
  )
}
