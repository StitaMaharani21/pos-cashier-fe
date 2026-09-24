import { cn } from "@/shared/lib/utils"

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

// The green "Aktif" / gray "Nonaktif" pill reused across every master-data
// list table (Menu, Menu Category, Payment Method).
export function StatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Nonaktif",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
        active ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground",
        className
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
