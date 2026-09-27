import type { ReactNode } from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface OptionCardProps {
  label: string
  checked: boolean
  onToggle: () => void
  // Icon or initial badge shown before the label.
  leading?: ReactNode
  // "row": leading + label + box in one line (card types); "stacked":
  // leading badge above the label (card networks, banks, e-wallets).
  layout?: "row" | "stacked"
  disabled?: boolean
}

// A selectable tile with its own checkbox — the "Tipe kartu" / "Jaringan
// kartu" / bank / e-wallet grids of the design.
export function OptionCard({
  label,
  checked,
  onToggle,
  leading,
  layout = "stacked",
  disabled,
}: OptionCardProps) {
  const box = (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded border-2",
        checked ? "border-foreground text-foreground" : "border-muted-foreground/60"
      )}
    >
      {checked && <CheckIcon className="size-3.5" strokeWidth={3} />}
    </span>
  )

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:bg-muted/50"
      )}
    >
      {layout === "row" ? (
        <span className="flex items-center gap-2.5">
          {leading}
          <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
          {box}
        </span>
      ) : (
        <span className="flex flex-col gap-2">
          <span className="flex items-start justify-between gap-2">
            {leading}
            {box}
          </span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </span>
      )}
    </button>
  )
}

// Round initial badge used as `leading` for networks / banks / e-wallets.
export function InitialBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 items-center justify-center rounded-full text-xs font-bold",
        active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
      )}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  )
}
