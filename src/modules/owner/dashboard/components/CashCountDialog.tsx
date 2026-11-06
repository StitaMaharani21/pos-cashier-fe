import { toast } from "sonner"

import { useRecordCashCount } from "@/modules/owner/dashboard/dashboard.queries"
import {
  cashCountSchema,
  type CashCountFormValues,
} from "@/modules/owner/dashboard/schemas/cash-count.schema"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { NumberInput } from "@/shared/ui/number-input"
import { friendlyErrorMessage } from "@/shared/api/error-message"

// The shift whose drawer is counted (one cashier's shift).
export interface CashCountTarget {
  shiftId: number
  cashierName?: string
  // Cash that should be in the drawer right now.
  expectedAmount: number
}

interface CashCountDialogProps {
  // null keeps the dialog closed.
  target: CashCountTarget | null
  onOpenChange: (open: boolean) => void
}

export function CashCountDialog({ target, onOpenChange }: CashCountDialogProps) {
  const open = target !== null
  const mutation = useRecordCashCount(target?.shiftId)
  const form = useCrudForm({
    schema: cashCountSchema,
    defaultValues: { countedAmount: "", notes: "" },
  })

  function onSubmit(values: CashCountFormValues) {
    mutation.mutate(
      { counted_amount: Number(values.countedAmount), notes: values.notes ?? "" },
      {
        onSuccess: () => {
          toast.success("Hitungan uang di laci tersimpan")
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          toast.error(friendlyErrorMessage(error, "Hitungan uang belum tersimpan. Coba lagi."))
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Hitung Uang di Laci{target?.cashierName ? ` — ${target.cashierName}` : ""}
          </DialogTitle>
          <DialogDescription>
            {target
              ? `Uang yang seharusnya ada di laci sekarang: ${formatRupiah(target.expectedAmount)}`
              : "Kasir belum dibuka, belum ada yang bisa dicatat."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="countedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Uang Hasil Hitung (Rp)</FormLabel>
                  <FormControl>
                    <NumberInput
                      maxDigits={12}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (opsional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending || !target}>
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
