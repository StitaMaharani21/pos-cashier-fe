import { InboxIcon, TriangleAlertIcon, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"

interface ReportStateCardProps {
  icon?: LucideIcon
  tone?: "muted" | "danger"
  title: string
  hint?: string
  onRetry?: () => void
  // Extra call-to-action under the hint, e.g. TaxTab's "Atur di Pengaturan
  // Bisnis" link for the "tax rate not configured" empty state — distinct
  // from onRetry's "Coba lagi" button, and can be shown alongside it.
  action?: ReactNode
}

// Shared empty/error placeholder for the card-shaped tab bodies (Ringkasan,
// Metode Pembayaran, Diskon aren't tables, so table-states.tsx's MessageRow
// doesn't apply) — same visual language (icon chip, title, hint, retry).
export function ReportStateCard({ icon, tone = "muted", title, hint, onRetry, action }: ReportStateCardProps) {
  const Icon = icon ?? (tone === "danger" ? TriangleAlertIcon : InboxIcon)

  return (
    <Card className="items-center gap-2 p-12 text-center">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-full",
          tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <p className="font-semibold text-foreground">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Coba lagi
        </Button>
      )}
      {action && <div className="mt-1">{action}</div>}
    </Card>
  )
}
