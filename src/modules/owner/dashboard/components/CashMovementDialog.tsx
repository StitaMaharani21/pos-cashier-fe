import { toast } from "sonner"

import { useRecordCashMovement } from "@/modules/owner/dashboard/dashboard.queries"
import {
  cashMovementSchema,
  type CashMovementFormValues,
  type CashMovementType,
} from "@/modules/owner/dashboard/schemas/cash-movement.schema"
import { ApiError } from "@/shared/api/client"
import { friendlyErrorMessage } from "@/shared/api/error-message"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { cn } from "@/shared/lib/utils"
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

const TYPE_OPTIONS: { value: CashMovementType; label: string; hint: string }[] = [
  { value: "in", label: "Kas Masuk", hint: "Menambah uang di laci (mis. pemilik menambah modal)" },
  { value: "out", label: "Kas Keluar", hint: "Uang keluar dari laci (mis. beli perlengkapan)" },
]

interface CashMovementDialogProps {
  // The open shift the movement is booked on; null keeps the dialog closed.
  shiftId: number | null
  onOpenChange: (open: boolean) => void
}

// Records a cash movement outside a sale on the running shift
// (POST /shifts/:id/cash-transactions). Kas Masuk raises the expected cash,
// Kas Keluar lowers it: Expected = Kas Awal + Penjualan Tunai + Kas Masuk −
// Kas Keluar − Refund (all refunds are paid in cash). The explanation is required so the difference at
// closing can be traced.
export function CashMovementDialog({ shiftId, onOpenChange }: CashMovementDialogProps) {
  const mutation = useRecordCashMovement(shiftId ?? undefined)
  const form = useCrudForm({
    schema: cashMovementSchema,
    defaultValues: { type: "in" as CashMovementType, amount: "", description: "" },
  })

  function handleOpenChange(open: boolean) {
    if (mutation.isPending) return
    if (!open) form.reset()
    onOpenChange(open)
  }

  function onSubmit(values: CashMovementFormValues) {
    mutation.mutate(
      { type: values.type, amount: Number(values.amount), description: values.description.trim() },
      {
        onSuccess: () => {
          toast.success(values.type === "in" ? "Kas masuk tercatat" : "Kas keluar tercatat")
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiError && error.code === "SHIFT_ALREADY_CLOSED") {
            toast.error("Kasir ini sudah ditutup, uang tidak bisa dicatat lagi.")
            onOpenChange(false)
            return
          }
          toast.error(friendlyErrorMessage(error, "Gagal mencatat kas. Coba lagi."))
        },
      }
    )
  }

  return (
    <Dialog open={shiftId !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Kas Laci</DialogTitle>
          <DialogDescription>
            Catat uang tunai yang masuk atau keluar dari laci di luar penjualan. Jumlahnya langsung masuk ke
            hitungan uang yang seharusnya ada.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis</FormLabel>
                  <div role="group" aria-label="Jenis catatan uang" className="grid grid-cols-2 gap-2">
                    {TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={field.value === option.value}
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "min-h-11 cursor-pointer rounded-xl border px-3 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          field.value === option.value
                            ? "border-primary bg-primary/10 text-primary-strong"
                            : "bg-card text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <FormDescription>{TYPE_OPTIONS.find((option) => option.value === field.value)?.hint}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1000} inputMode="numeric" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Mis. Tambah modal, beli galon air" {...field} />
                  </FormControl>
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
