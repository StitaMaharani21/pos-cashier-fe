import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import {
  adjustIngredientStockSchema,
  type AdjustIngredientStockFormValues,
} from "@/modules/owner/ingredient/schemas/adjust-stock.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"

interface AdjustIngredientStockDialogProps {
  row: Ingredient | null
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (delta: number, keterangan: string) => void
}

// PATCH /master/ingredients/{id}/stock — delta can be either sign (positive
// for goods received, negative for a stock-opname correction), keterangan
// is required and gets recorded in the trx_stock_movement audit row (see
// this feature's README).
export function AdjustIngredientStockDialog({
  row,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: AdjustIngredientStockDialogProps) {
  const form = useCrudForm({
    schema: adjustIngredientStockSchema,
    defaultValues: { delta: "", keterangan: "" },
  })

  const delta = Number(form.watch("delta"))
  const currentStock = row?.stock ?? 0
  const previewStock = Number.isNaN(delta) ? currentStock : currentStock + delta

  function handleSubmit(values: AdjustIngredientStockFormValues) {
    onSubmit(Number(values.delta), values.keterangan)
  }

  return (
    <Dialog
      open={row != null}
      onOpenChange={(open) => {
        if (!open) form.reset({ delta: "", keterangan: "" })
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sesuaikan Stok — {row?.name}</DialogTitle>
          <DialogDescription>
            Stok saat ini: {currentStock} {row?.unit}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="delta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Penyesuaian</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="mis. 10 atau -3"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="mis. Barang datang dari supplier, atau koreksi stock opname"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <p className="text-sm text-muted-foreground">
              Stok setelah disesuaikan:{" "}
              <span className="font-semibold text-foreground">{previewStock}</span> {row?.unit}
            </p>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Sesuaikan Stok"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
