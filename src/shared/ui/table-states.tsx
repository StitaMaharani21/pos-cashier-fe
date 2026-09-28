import type { ReactNode } from "react"
import { InboxIcon, TriangleAlertIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { TableCell, TableRow } from "@/shared/ui/table"

// Loading / empty / error rows shared by every table (see README "Tabel").

const TONES = {
  muted: "bg-muted text-muted-foreground",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-emerald-500/10 text-emerald-600",
} as const

export function TableSkeletonRows({ colSpan, rows = 5 }: { colSpan: number; rows?: number }) {
  return Array.from({ length: rows }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-3">
        <div className="h-9 animate-pulse rounded-lg bg-muted" />
      </TableCell>
    </TableRow>
  ))
}

function MessageRow({
  colSpan,
  icon: Icon,
  tone = "muted",
  title,
  hint,
  action,
}: {
  colSpan: number
  icon: LucideIcon
  tone?: "muted" | "danger" | "success"
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-12 whitespace-normal">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className={cn("flex size-11 items-center justify-center rounded-full", TONES[tone])}>
            <Icon className="size-5" />
          </span>
          <p className="font-semibold text-foreground">{title}</p>
          {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
          {action && <div className="mt-1">{action}</div>}
        </div>
      </TableCell>
    </TableRow>
  )
}

export interface TableEmptyState {
  icon?: LucideIcon
  // "success" when an empty result is the good news (Cek Selisih Stok).
  tone?: "muted" | "success"
  title: string
  hint?: string
  action?: ReactNode
}

export function TableEmptyRow({ colSpan, icon = InboxIcon, ...state }: TableEmptyState & { colSpan: number }) {
  return <MessageRow colSpan={colSpan} icon={icon} {...state} />
}

export function TableErrorRow({
  colSpan,
  title = "Gagal memuat data",
  hint,
  onRetry,
}: {
  colSpan: number
  title?: string
  hint?: string
  onRetry?: () => void
}) {
  return (
    <MessageRow
      colSpan={colSpan}
      icon={TriangleAlertIcon}
      tone="danger"
      title={title}
      hint={hint}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        )
      }
    />
  )
}
