import { CircleCheck, Gift, QrCode, type LucideIcon } from "lucide-react"

import type { RegistrationPurchaseMode } from "@/modules/public/store-registration/presentation/registration-plans"
import { cn } from "@/shared/lib/utils"

interface PurchaseModeFieldProps {
  mode: RegistrationPurchaseMode
  onChange: (mode: RegistrationPurchaseMode) => void
  // Display price of one month of the chosen plan ("Rp99.000"). The amount
  // actually charged comes from the backend's plan catalogue.
  price: string
  planName: string
  disabled?: boolean
}

// "Cara memulai": register for free (trial) or buy 1 month right away.
// Radiogroup rather than a checkbox so both options state what they cost.
export function PurchaseModeField({ mode, onChange, price, planName, disabled }: PurchaseModeFieldProps) {
  const options: { id: RegistrationPurchaseMode; icon: LucideIcon; title: string; body: string }[] = [
    {
      id: "trial",
      icon: Gift,
      title: "Coba Gratis",
      body: "Daftar dulu tanpa pembayaran. Toko aktif setelah disetujui tim.",
    },
    {
      id: "paid",
      icon: QrCode,
      title: `Beli Langsung ${planName} 1 Bulan`,
      body: `${price} via QRIS. Masa aktif mulai saat toko disetujui.`,
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-neela-label-md text-neela-on-surface">Cara Memulai</p>
      <div role="radiogroup" aria-label="Cara memulai" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map(({ id, icon: Icon, title, body }) => {
          const selected = id === mode
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(id)}
              className={cn(
                "flex h-full flex-col gap-1 rounded-xl border-2 p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70",
                selected
                  ? "border-neela-primary-container bg-neela-primary-fixed/40"
                  : "border-neela-surface-container-high bg-neela-surface-container-lowest hover:border-neela-primary-fixed-dim"
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-neela-label-md text-neela-on-surface">
                  <Icon className="size-4 shrink-0 text-neela-primary" />
                  {title}
                </span>
                {selected ? (
                  <CircleCheck className="size-5 shrink-0 fill-neela-primary-container text-neela-surface-container-lowest" />
                ) : (
                  <span className="size-5 shrink-0 rounded-full border-2 border-neela-outline-variant" />
                )}
              </span>
              <span className="text-neela-body-sm text-neela-on-surface-variant">{body}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
