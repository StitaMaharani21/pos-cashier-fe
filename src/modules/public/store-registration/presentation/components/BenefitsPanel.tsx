import { BadgeCheck, CircleCheck, ClipboardList, Info, Lock, Rocket, type LucideIcon } from "lucide-react"

import {
  REGISTRATION_PLANS,
  type RegistrationPlan,
  type RegistrationPlanId,
} from "@/modules/public/store-registration/presentation/registration-plans"
import { cn } from "@/shared/lib/utils"

// Mirrors what actually happens after submit (pos-kasir-be store_registration):
// the request is queued as "pending" until an internal admin approves it,
// and approval is what provisions the store — it is not instant.
const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ClipboardList, title: "Isi formulir", body: "Data toko & akun pemilik." },
  { icon: BadgeCheck, title: "Verifikasi tim Neela", body: "Kami tinjau & hubungi kamu." },
  { icon: Rocket, title: "Toko siap dipakai", body: "Masuk dengan email & kata sandi." },
]

interface BenefitsPanelProps {
  plan: RegistrationPlan
  onPlanChange: (id: RegistrationPlanId) => void
  // Set when the visitor arrived asking for a plan that isn't selectable
  // yet (e.g. the landing's "Pilih Paket Pro Dine-In") and was put on the
  // default plan instead.
  requestedPlan?: RegistrationPlan
}

// Left column of the Stitch design, driven by REGISTRATION_PLANS. The
// customer review card is dropped (no real customers yet), and the "Paket
// Pro Gratis — Akses Penuh" framing is replaced by the plan the backend
// actually provisions.
export function BenefitsPanel({ plan, onPlanChange, requestedPlan }: BenefitsPanelProps) {
  return (
    // order-2 below lg: on phones the form comes first, benefits after it.
    <div className="order-2 flex flex-col gap-6 lg:order-none lg:col-span-5">
      <div className="rounded-2xl bg-neela-surface-container-lowest p-6 shadow-sm">
        <p className="mb-3 text-neela-label-md text-neela-on-surface">Pilih Paket</p>
        {/* Equal-height option cards (name + price + status on fixed rows)
            rather than a segmented pill — an unavailable plan's extra
            "Segera hadir" line no longer throws the two options out of line. */}
        <div role="radiogroup" aria-label="Paket langganan" className="grid grid-cols-2 gap-3">
          {REGISTRATION_PLANS.map((option) => {
            const selected = option.id === plan.id
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!option.available}
                onClick={() => onPlanChange(option.id)}
                className={cn(
                  "flex h-full flex-col gap-1 rounded-xl border-2 p-3 text-left transition-all",
                  selected
                    ? "border-neela-primary-container bg-neela-primary-fixed/40"
                    : option.available
                      ? "border-neela-surface-container-high bg-neela-surface-container-lowest hover:border-neela-primary-fixed-dim"
                      : "cursor-not-allowed border-dashed border-neela-outline-variant bg-neela-surface-container-low"
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-neela-label-md",
                      option.available ? "text-neela-on-surface" : "text-neela-on-surface-variant"
                    )}
                  >
                    {option.name}
                  </span>
                  {selected ? (
                    <CircleCheck className="size-5 shrink-0 fill-neela-primary-container text-neela-surface-container-lowest" />
                  ) : option.available ? (
                    <span className="size-5 shrink-0 rounded-full border-2 border-neela-outline-variant" />
                  ) : (
                    <span className="shrink-0 rounded-full bg-neela-surface-container-high px-2 py-0.5 text-[10px] font-bold tracking-wide text-neela-on-surface-variant uppercase">
                      Segera hadir
                    </span>
                  )}
                </span>
                <span className={cn("text-neela-body-sm", option.available ? "text-neela-on-surface-variant" : "text-neela-outline")}>
                  <span className="font-bold">{option.price}</span> / outlet / bln
                </span>
              </button>
            )
          })}
        </div>

        {requestedPlan && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-neela-primary-fixed/50 px-3 py-2 text-neela-body-sm text-neela-on-primary-fixed-variant">
            <Info className="mt-px size-4 shrink-0" />
            <span>
              Paket {requestedPlan.name} belum bisa dipilih saat pendaftaran. Toko kamu aktif di paket{" "}
              {plan.name} dulu — upgrade ke {requestedPlan.name} dibantu tim kami setelah toko aktif.
            </span>
          </p>
        )}

        <div className="my-5 h-px bg-neela-surface-container-high" />

        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-neela-primary-fixed text-neela-primary">
            <BadgeCheck className="size-6" />
          </div>
          <div>
            <span className="inline-block rounded bg-neela-tertiary-fixed px-1 py-0.5 text-[11px] font-bold tracking-wider text-neela-on-tertiary-fixed uppercase">
              {plan.badge}
            </span>
            <h3 className="text-neela-headline-sm text-neela-on-primary-fixed">{plan.title}</h3>
          </div>
        </div>
        <p className="mb-4 text-neela-body-md text-neela-on-surface-variant">{plan.description}</p>
        <ul className="flex flex-col gap-3">
          {plan.benefits.map(({ icon: Icon, iconClassName, title, body }) => (
            <li key={title} className="flex items-start gap-2">
              <div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-neela-surface-container ${iconClassName}`}>
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-neela-label-md text-neela-on-surface">{title}</p>
                <p className="text-neela-body-sm text-neela-on-surface-variant">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-neela-surface-container-lowest p-6 shadow-sm">
        <h3 className="mb-4 text-neela-label-lg text-neela-on-surface">Alur Pendaftaran</h3>
        <ol className="flex flex-col gap-3">
          {STEPS.map(({ icon: Icon, title, body }, index) => (
            <li key={title} className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neela-primary-fixed text-neela-primary">
                <Icon className="size-[18px]" />
              </div>
              <div>
                <p className="text-neela-label-md text-neela-on-surface">
                  {index + 1}. {title}
                </p>
                <p className="text-neela-body-sm text-neela-on-surface-variant">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-neela-surface-container-low px-3 py-2 text-neela-body-sm text-neela-on-surface-variant">
          <Lock className="size-4 shrink-0 text-neela-tertiary" />
          Kata sandi disimpan terenkripsi dan tidak pernah ditampilkan ke siapa pun.
        </p>
      </div>
    </div>
  )
}
