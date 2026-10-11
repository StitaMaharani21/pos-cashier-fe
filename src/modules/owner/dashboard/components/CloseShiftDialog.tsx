import { toast } from "sonner"

import { useCloseShift } from "@/modules/owner/dashboard/dashboard.queries"
import {
  closeShiftSchema,
  type CloseShiftFormValues,
} from "@/modules/owner/dashboard/schemas/close-shift.schema"
import { ApiError } from "@/shared/api/client"
import { friendlyErrorMessage } from "@/shared/api/error-message"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"

export interface ShiftToClose {
  id: number
  // Shown in the title when known (the dashboard's cash summary has no name).
  cashierName?: string
  // The system's estimate of the cash that should be in the drawer.
  expectedAmount: number
}

interface CloseShiftDialogProps {
  // The open shift being closed; null keeps the dialog closed.
  shift: ShiftToClose | null
  onOpenChange: (open: boolean) => void
}

// Owner closes a still-open shift (PATCH /shifts/:id/close — the backend
// allows both owner and cashier, on every plan). Used from the dashboard's
// "Aktual Cash Laci" card (all plans) and from Laporan Kas (Pro). The owner
// types the cash actually in the drawer; Laporan Kas then shows the
// difference against the estimate.
export function CloseShiftDialog({ shift, onOpenChange }: CloseShiftDialogProps) {
  const mutation = useCloseShift(shift?.id)
  const form = useCrudForm({
    schema: closeShiftSchema,
    defaultValues: { closingBalance: "" },
  })

  function handleOpenChange(open: boolean) {
    if (mutation.isPending) return
    if (!open) form.reset()
    onOpenChange(open)
  }

  function onSubmit(values: CloseShiftFormValues) {
    mutation.mutate(Number(values.closingBalance), {
      onSuccess: () => {
        toast.success("Shift berhasil ditutup")
        form.reset()
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof ApiError && error.code === "SHIFT_ALREADY_CLOSED") {
          toast.error("Shift ini sudah ditutup sebelumnya.")
          onOpenChange(false)
          return
        }
        toast.error(friendlyErrorMessage(error, "Gagal menutup shift. Coba lagi."))
      },
    })
  }

  return (
    <Dialog open={shift !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shift?.cashierName ? `Tutup shift ${shift.cashierName}?` : "Tutup shift yang berjalan?"}</DialogTitle>
          <DialogDescription>
            Hitung uang tunai yang ada di laci kasir sekarang, lalu masukkan jumlahnya. Setelah ditutup, shift ini
            tidak bisa dibuka lagi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="closingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uang Tunai di Laci (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1000} inputMode="numeric" autoFocus {...field} />
                  </FormControl>
                  {shift && (
                    <FormDescription>
                      Perkiraan dari sistem: {formatRupiah(shift.expectedAmount)}. Selisihnya akan tercatat di
                      Laporan Kas.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="destructive" disabled={mutation.isPending}>
                {mutation.isPending ? "Menutup..." : "Tutup Shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
