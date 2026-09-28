import { cn } from "@/shared/lib/utils"

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

// The green "● Aktif" / gray "● Nonaktif" pill used by every table's
// Status column.
export function StatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Nonaktif",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
        active
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/60")} />
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
