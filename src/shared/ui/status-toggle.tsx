import { cn } from "@/shared/lib/utils"
import { Switch } from "@/shared/ui/switch"

interface StatusToggleProps {
  active: boolean
  // Row name for the screen-reader label, e.g. "Nonaktifkan Kopi".
  label: string
  disabled?: boolean
  onToggle: () => void
  className?: string
}

// The Status column of a master-data table: master data is never deleted, so
// this switch (Aktif / Nonaktif) is how a row is taken out of use.
export function StatusToggle({ active, label, disabled, onToggle, className }: StatusToggleProps) {
  return (
    <label className={cn("inline-flex items-center gap-2.5", className)}>
      <Switch
        checked={active}
        disabled={disabled}
        onCheckedChange={onToggle}
        aria-label={`${active ? "Nonaktifkan" : "Aktifkan"} ${label}`}
        className="data-[state=checked]:bg-emerald-500"
      />
      <span className={active ? "text-sm font-semibold text-emerald-600" : "text-sm text-muted-foreground"}>
        {active ? "Aktif" : "Nonaktif"}
      </span>
    </label>
  )
}
