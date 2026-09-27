import type { ComponentProps } from "react"
import { GripVerticalIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

// The ⋮⋮ grip at the start of a reorderable table row (see useRowReorder).
// A real button so it's focusable: ArrowUp/ArrowDown move the row.
export function DragHandle({ className, label, ...props }: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={`Ubah urutan ${label} (seret, atau tekan panah atas/bawah)`}
      className={cn(
        "flex size-8 cursor-grab items-center justify-center rounded-md text-muted-foreground/70 hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  )
}
