import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"

// The "Aksi" column: right-aligned outline icon buttons (Edit / Lihat /
// Hapus / one custom action) — at most 3 per row.
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2">{children}</div>
}

export function RowActionButton({
  icon: Icon,
  label,
  tone,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  // Screen-reader label + hover tooltip, e.g. "Edit Kopi Susu".
  label: string
  tone?: "danger"
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(tone === "danger" && "text-destructive hover:text-destructive")}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <Icon />
    </Button>
  )
}
