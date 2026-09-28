import { useState } from "react"

import type { Cashier } from "@/entities/cashier/model/cashier.types"
import { AvatarPicker } from "@/shared/ui/avatar-picker"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

interface CashierPhotoDialogProps {
  cashier: Cashier | null
  onOpenChange: (open: boolean) => void
  isSaving: boolean
  // file = upload it, null = remove the current photo.
  onSave: (cashier: Cashier, file: File | null) => void
}

// Opened from a cashier row's avatar / "Foto" button: the photo big, plus
// change / remove. Nothing is sent until "Simpan".
export function CashierPhotoDialog({ cashier, onOpenChange, isSaving, onSave }: CashierPhotoDialogProps) {
  return (
    <Dialog open={cashier != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {/* Keyed so each cashier starts from their own photo. */}
        {cashier && <PhotoBody key={cashier.id} cashier={cashier} onOpenChange={onOpenChange} isSaving={isSaving} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  )
}

function PhotoBody({
  cashier,
  onOpenChange,
  isSaving,
  onSave,
}: Omit<CashierPhotoDialogProps, "cashier"> & { cashier: Cashier }) {
  // undefined = untouched.
  const [next, setNext] = useState<File | null | undefined>(undefined)
  const changed = next !== undefined && !(next === null && !cashier.photo)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Foto Profil</DialogTitle>
        <DialogDescription>
          {cashier.name} · @{cashier.username}
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <AvatarPicker name={cashier.name} value={cashier.photo} onChange={setNext} size="lg" />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button type="button" disabled={!changed || isSaving} onClick={() => onSave(cashier, next ?? null)}>
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </>
  )
}
