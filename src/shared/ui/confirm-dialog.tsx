import { Button } from "@/shared/ui/button"
import { CrudDialogFrame } from "@/shared/ui/crud/CrudDialogFrame"

// "Hapus …?" confirmation used by every table's delete action.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  pendingLabel = "Menghapus...",
  isPending = false,
  disabled = false,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  pendingLabel?: string
  isPending?: boolean
  // e.g. a category that still has menus.
  disabled?: boolean
  onConfirm: () => void
}) {
  return (
    <CrudDialogFrame
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="destructive" disabled={isPending || disabled} onClick={onConfirm}>
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </>
      }
    >
      {null}
    </CrudDialogFrame>
  )
}
