import { toast } from "sonner"

import {
  SELISIH_STATUS_BADGE_CLASSNAME,
  SELISIH_STATUS_LABEL,
  formatSelisih,
  selisihStatus,
} from "@/modules/owner/cash-report/lib/selisih"
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
import { Textarea } from "@/shared/ui/textarea"

export interface ShiftToClose {
  id: number
  // Shown in the title when known (the dashboard's cash summary has no name).
  cashierName?: string
  // Expected cash in the drawer: opening + cash sales + cash in - cash out -
  // cash refund (the backend's single ExpectedCash formula).
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
// types the cash actually in the drawer; the dialog shows the difference
// against the expected cash (actual - expected) and asks for a note when they
// differ. Laporan Kas shows the same difference afterwards.
export function CloseShiftDialog({ shift, onOpenChange }: CloseShiftDialogProps) {
  const mutation = useCloseShift(shift?.id)
  const form = useCrudForm({
    schema: closeShiftSchema,
    defaultValues: { closingBalance: "", notes: "" },
  })

  const closingBalance = form.watch("closingBalance")
  const hasCounted = closingBalance !== "" && !Number.isNaN(Number(closingBalance))
  const difference = shift && hasCounted ? Number(closingBalance) - shift.expectedAmount : null
  const status = difference === null ? null : selisihStatus(difference)

  function handleOpenChange(open: boolean) {
    if (mutation.isPending) return
    if (!open) form.reset()
    onOpenChange(open)
  }

  function onSubmit(values: CloseShiftFormValues) {
    const notes = values.notes?.trim() ?? ""
    // Selisih != 0 must be explained (spec: "keterangan selisih"). Enforced
    // here, not in the backend, because the cashier app's logout-and-close
    // path sends no note.
    if (difference !== null && difference !== 0 && notes === "") {
      form.setError("notes", { message: "Jelaskan penyebab selisih kas" })
      return
    }
    mutation.mutate({ closing_balance: Number(values.closingBalance), closing_notes: notes }, {
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
                      Kas yang diharapkan: {formatRupiah(shift.expectedAmount)} (kas awal + penjualan cash +
                      kas masuk − kas keluar − refund cash).
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {difference !== null && status && (
              <div
                data-testid="close-shift-difference"
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">Selisih Kas</span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold tabular-nums">{formatSelisih(difference)}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${SELISIH_STATUS_BADGE_CLASSNAME[status]}`}
                  >
                    {SELISIH_STATUS_LABEL[status]}
                  </span>
                </span>
              </div>
            )}

            {difference !== null && difference !== 0 && (
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan Selisih</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="Mis. salah kembalian, kas kecil belum dicatat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
