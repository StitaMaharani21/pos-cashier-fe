import { useState } from "react"
import { Gauge } from "lucide-react"
import { Navigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import {
  registrationConflict,
  useSubmitRegistration,
} from "@/modules/public/store-registration/application/useSubmitRegistration"
import {
  EMPTY_REGISTRATION_FORM,
  storeRegistrationSchema,
  toSubmitPayload,
  type StoreRegistrationFormValues,
} from "@/modules/public/store-registration/domain/store-registration.schema"
import { BenefitsPanel } from "@/modules/public/store-registration/presentation/components/BenefitsPanel"
import {
  RegistrationFooter,
  RegistrationHeader,
} from "@/modules/public/store-registration/presentation/components/RegistrationChrome"
import { RegistrationForm } from "@/modules/public/store-registration/presentation/components/RegistrationForm"
import { RegistrationSuccess } from "@/modules/public/store-registration/presentation/components/RegistrationSuccess"
import {
  DEFAULT_REGISTRATION_PLAN,
  REGISTRATION_PLANS,
  findRegistrationPlan,
  type RegistrationPlanId,
} from "@/modules/public/store-registration/presentation/registration-plans"
import { waLink } from "@/modules/public/shared/contact"
import { useIsOwnerSession } from "@/modules/public/shared/useIsOwnerSession"
import { ApiError, NetworkError } from "@/shared/api/client"
import { useCrudForm } from "@/shared/hooks/useCrudForm"

// Public self-service store registration ("/daftar", the landing page's
// "Daftar Early Access"). Submits to pos-kasir-be's
// POST /internal/store-registrations, which only queues the request — an
// internal admin approves it before the store is actually provisioned.
export function StoreRegistrationPage() {
  const isOwner = useIsOwnerSession()
  const [submitted, setSubmitted] = useState<{ email: string; storeName: string } | null>(null)
  const mutation = useSubmitRegistration()

  const form = useCrudForm<StoreRegistrationFormValues>({
    schema: storeRegistrationSchema,
    defaultValues: EMPTY_REGISTRATION_FORM,
  })

  // ?paket=<id> comes from the landing's plan buttons. A plan that isn't
  // selectable yet falls back to the default (Starter) with a notice —
  // the backend provisions every registration on Starter regardless.
  const [searchParams] = useSearchParams()
  const requested = findRegistrationPlan(searchParams.get("paket"))
  const [planId, setPlanId] = useState<RegistrationPlanId>(
    requested?.available ? requested.id : DEFAULT_REGISTRATION_PLAN
  )
  const plan = findRegistrationPlan(planId) ?? REGISTRATION_PLANS[0]
  const unavailableRequest = requested && !requested.available ? requested : undefined

  // An owner who's already logged in has a store — nothing to sign up for.
  if (isOwner) return <Navigate to="/app" replace />

  function handleSubmit(values: StoreRegistrationFormValues) {
    const payload = toSubmitPayload(values)
    mutation.mutate(payload, {
      onSuccess: () => {
        setSubmitted({ email: payload.owner_email, storeName: payload.store_name })
        window.scrollTo({ top: 0, behavior: "smooth" })
      },
      onError: (error) => {
        const conflict = registrationConflict(error)
        if (conflict === "email_pending") {
          form.setError("ownerEmail", {
            message: "Pendaftaran dengan email ini sedang ditinjau tim kami.",
          })
          return
        }
        if (conflict === "email_active") {
          form.setError("ownerEmail", {
            message: "Email ini sudah terdaftar di toko aktif. Silakan masuk ke portal.",
          })
          return
        }
        if (error instanceof NetworkError) {
          toast.error("Tidak dapat terhubung ke server. Coba lagi beberapa saat.")
          return
        }
        toast.error(
          error instanceof ApiError ? error.message : "Pendaftaran gagal dikirim. Coba lagi."
        )
      },
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-neela-surface font-neela text-neela-body-md text-neela-on-surface antialiased">
      <RegistrationHeader />

      <main className="relative w-full flex-1 overflow-hidden pt-16">
        <div className="pointer-events-none absolute -top-36 -left-36 size-96 rounded-full bg-neela-primary-fixed opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 -right-32 size-80 rounded-full bg-neela-tertiary-fixed opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-1/3 size-64 rounded-full bg-neela-secondary-fixed opacity-30 blur-2xl" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-8 md:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-neela-surface-container-high px-3 py-1 text-neela-primary shadow-sm">
              <span className="text-neela-label-sm font-bold tracking-wider uppercase">
                Early Access • Tanpa Kartu Kredit
              </span>
            </div>
            <h1 className="text-neela-headline-xl-mobile tracking-tight text-neela-on-primary-fixed md:text-neela-headline-xl">
              Daftarkan Toko Anda,{" "}
              <span className="text-neela-primary-container">Nikmati Kasir Lancar</span>
            </h1>
            <p className="mt-1 text-neela-body-lg text-neela-on-surface-variant">
              Solusi POS cloud cerdas dengan ketangguhan offline-first untuk kafe, resto, dan UMKM
              kuliner di seluruh Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            <BenefitsPanel
              plan={plan}
              onPlanChange={setPlanId}
              requestedPlan={unavailableRequest}
            />

            <div className="order-1 lg:order-none lg:col-span-7">
              <div className="rounded-2xl bg-neela-surface-container-lowest p-4 shadow-md sm:p-8">
                {submitted ? (
                  <RegistrationSuccess email={submitted.email} storeName={submitted.storeName} />
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-neela-headline-md text-neela-on-primary-fixed">
                        Formulir Pendaftaran Toko
                      </h2>
                      <p className="mt-1 text-neela-body-md text-neela-on-surface-variant">
                        Lengkapi data toko dan akun pemilik. Tim kami akan memverifikasi sebelum toko
                        diaktifkan.
                      </p>
                    </div>
                    <RegistrationForm
                      form={form}
                      isSubmitting={mutation.isPending}
                      onSubmit={handleSubmit}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-neela-surface-container-lowest p-6 shadow-sm">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-neela-tertiary-fixed text-neela-on-tertiary-fixed">
                  <Gauge className="size-7" />
                </div>
                <div>
                  <h4 className="text-neela-headline-sm text-neela-on-surface">
                    Punya Lebih dari 3 Cabang Toko?
                  </h4>
                  <p className="text-neela-body-md text-neela-on-surface-variant">
                    Dapatkan demonstrasi tatap muka langsung di outlet Anda bersama tim spesialis
                    implementasi kami.
                  </p>
                </div>
              </div>
              <a
                href={waLink("Halo Neela POS, saya punya lebih dari 3 cabang dan ingin jadwalkan demo")}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-neela-surface-container px-4 py-2 text-neela-label-md font-semibold text-neela-primary transition-colors hover:bg-neela-surface-container-high"
              >
                Jadwalkan Demo Khusus →
              </a>
            </div>
          </div>
        </div>
      </main>

      <RegistrationFooter />
    </div>
  )
}
