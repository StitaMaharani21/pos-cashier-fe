import { useState } from "react"
import { Trash2Icon } from "lucide-react"

import { Button } from "@/shared/ui/button"

// Batal / Simpan pinned under the scrolling body; on edit, Hapus on the
// left asks once more before deleting.
export function DrawerFooter({
  submitLabel,
  isSubmitting,
  onCancel,
  onDelete,
  isDeleting,
}: {
  submitLabel: string
  isSubmitting: boolean
  onCancel: () => void
  onDelete?: () => void
  isDeleting?: boolean
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center gap-2.5 border-t px-6 py-4">
      {onDelete && (
        <Button
          type="button"
          variant={confirming ? "destructive" : "ghost"}
          className={confirming ? undefined : "text-destructive hover:text-destructive"}
          disabled={isDeleting}
          onClick={() => (confirming ? onDelete() : setConfirming(true))}
          onBlur={() => setConfirming(false)}
        >
          <Trash2Icon className="size-4" />
          {isDeleting ? "Menghapus..." : confirming ? "Yakin hapus?" : "Hapus"}
        </Button>
      )}
      <div className="ml-auto flex gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : submitLabel}
        </Button>
      </div>
    </div>
  )
}
