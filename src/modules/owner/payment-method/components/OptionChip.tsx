import { CheckIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface OptionChipProps {
  label: string
  checked: boolean
  onToggle: () => void
  disabled?: boolean
}

// A small selectable pill — the "Tipe kartu" / "Jaringan kartu" / bank /
// e-wallet choices. One click toggles it; selected = blue with a check.
export function OptionChip({ label, checked, onToggle, disabled }: OptionChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        checked
          ? "border-primary bg-primary/10 text-primary-strong"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {checked && <CheckIcon className="size-3.5" strokeWidth={3} />}
      {label}
    </button>
  )
}
