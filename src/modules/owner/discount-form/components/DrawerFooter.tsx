import { Button } from "@/shared/ui/button"

// Batal / Simpan pinned under the scrolling body. There is no Hapus: master
// data is only ever switched off (Nonaktifkan on the table row).
export function DrawerFooter({
  submitLabel,
  isSubmitting,
  onCancel,
}: {
  submitLabel: string
  isSubmitting: boolean
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2.5 border-t px-6 py-4">
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
