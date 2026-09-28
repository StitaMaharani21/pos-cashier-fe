import type { ReactNode } from "react"
import { SearchIcon } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"

// Search · filters · "Reset filter" · primary action (right) above a table.
export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Cari...",
  children,
  filtering = false,
  onReset,
  action,
}: {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  // Filters (FilterSelect, date range, ...).
  children?: ReactNode
  // Shows "Reset filter" when true and onReset is given.
  filtering?: boolean
  onReset?: () => void
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {onSearchChange && (
        <div className="relative w-full max-w-md min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder.replace(/\.+$/, "")}
            className="h-10 bg-card pl-10"
          />
        </div>
      )}
      {children}
      {filtering && onReset && (
        <Button variant="ghost" onClick={onReset}>
          Reset filter
        </Button>
      )}
      {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
    </div>
  )
}
