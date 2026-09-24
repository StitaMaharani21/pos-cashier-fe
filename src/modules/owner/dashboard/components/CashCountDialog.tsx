import { toast } from "sonner"

import type { CashSummary } from "@/entities/shift/model/shift.types"
import { useRecordCashCount } from "@/modules/owner/dashboard/dashboard.queries"
import {
  cashCountSchema,
  type CashCountFormValues,
} from "@/modules/owner/dashboard/schemas/cash-count.schema"
import { ApiError, NetworkError } from "@/shared/api/client"
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

interface CashCountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cashSummary: CashSummary | undefined
}

export function CashCountDialog({ open, onOpenChange, cashSummary }: CashCountDialogProps) {
  const mutation = useRecordCashCount(cashSummary?.shift_id)
  const form = useCrudForm({
    schema: cashCountSchema,
    defaultValues: { countedAmount: "", notes: "" },
  })

  function onSubmit(values: CashCountFormValues) {
    mutation.mutate(
      { counted_amount: Number(values.countedAmount), notes: values.notes ?? "" },
      {
        onSuccess: () => {
          toast.success("Hitungan kas fisik tersimpan")
          form.reset()
          onOpenChange(false)
        },
        onError: (error) => {
          if (error instanceof ApiError || error instanceof NetworkError) {
            toast.error(error.message)
          } else {
            toast.error("Gagal menyimpan hitungan kas")
          }
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hitungan Kas Fisik</DialogTitle>
          <DialogDescription>
            {cashSummary
              ? `Kas seharusnya di laci saat ini: ${formatRupiah(cashSummary.expected_amount ?? 0)}`
              : "Tidak ada shift aktif untuk dicatat."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="countedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Kas Terhitung (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1000} {...field} />
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
              <Button type="submit" disabled={mutation.isPending || !cashSummary}>
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
