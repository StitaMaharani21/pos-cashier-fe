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
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {onSearchChange && (
        <div className="relative w-full flex-1 sm:max-w-md sm:min-w-55">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder.replace(/\.+$/, "")}
            className="h-11 bg-card pl-10 sm:h-10"
          />
        </div>
      )}
      {children}
      {filtering && onReset && (
        <Button variant="ghost" className="h-10" onClick={onReset}>
          Reset filter
        </Button>
      )}
      {/* ml-auto only once there's room for it — on a phone the primary
          action sits on its own line at full width instead of being
          squeezed next to the search box. */}
      {action && (
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto [&>div]:w-full [&>div]:sm:w-auto [&_button]:flex-1 [&_button]:sm:flex-none">
          {action}
        </div>
      )}
    </div>
  )
}
