import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

// Square icon tile for a table's first column (category, voucher, ...).
export function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", className)}>
      <Icon className="size-4" />
    </span>
  )
}

// The primary column: optional tile/avatar/thumbnail, bold name, muted
// second line (code, username, ...).
export function TitleCell({ leading, title, subtitle }: { leading?: ReactNode; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {leading}
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold text-foreground">{title}</span>
        {subtitle && <span className="truncate text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  )
}
