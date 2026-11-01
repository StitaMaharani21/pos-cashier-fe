import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { adjustIngredientStock, adjustMenuStock } from "@/modules/owner/stock-history/api/stock-history.service"
import { invalidateStockQueries } from "@/modules/owner/stock-history/lib/invalidate-stock"
import type { StockItem } from "@/modules/owner/stock-history/lib/stock-item"
import {
  createStockAdjustSchema,
  type StockAdjustFormValues,
} from "@/modules/owner/stock-history/schemas/stock-change.schema"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatNumber } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { DialogFooter } from "@/shared/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { NumberInput } from "@/shared/ui/number-input"
import { Textarea } from "@/shared/ui/textarea"

// "Koreksi": fix the stock figure up or down (spoiled, miscounted, sold past
// zero) with a required reason; shows in Riwayat Stok as "Koreksi stok". Goods
// that just arrived belong in "Stok Masuk" instead.
export function StockAdjustForm({ item, onDone }: { item: StockItem; onDone: () => void }) {
  const queryClient = useQueryClient()
  const isIngredient = item.source === "ingredient"
  const schema = useMemo(() => createStockAdjustSchema({ wholeNumber: !isIngredient }), [isIngredient])
  const form = useCrudForm({ schema, defaultValues: { delta: "", keterangan: "" } })

  const mutation = useMutation({
    mutationFn: (values: StockAdjustFormValues) => {
      const payload = { delta: Number(values.delta), keterangan: values.keterangan.trim() }
      return isIngredient ? adjustIngredientStock(item.id, payload) : adjustMenuStock(item.id, payload)
    },
    onSuccess: () => {
      toast.success("Stok dikoreksi")
      invalidateStockQueries(queryClient)
      onDone()
    },
    onError: (error) => toast.error(error instanceof CrudServiceError ? error.message : "Stok belum berhasil dikoreksi. Coba lagi."),
  })

  const delta = Number(form.watch("delta"))
  const current = item.stock ?? 0
  const preview = Number.isFinite(delta) && delta !== 0 ? Math.round((current + delta) * 1000) / 1000 : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="delta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Koreksi ({item.unit})</FormLabel>
              <FormControl>
                <NumberInput
                  decimals={isIngredient ? 3 : 0}
                  allowNegative
                  maxDigits={9}
                  placeholder="mis. 5 atau -3"
                  autoFocus
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Angka positif menambah, negatif mengurangi. Untuk barang yang baru datang, pakai Stok Masuk.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alasan</FormLabel>
              <FormControl>
                <Textarea placeholder="mis. Barang basi, tumpah, atau hasil hitung ulang stok" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {preview != null && (
          <p className="text-sm text-muted-foreground">
            Stok setelah dikoreksi: <span className="font-semibold text-foreground">{formatNumber(preview)}</span> {item.unit}
            {!isIngredient && preview <= 0 && " — menu akan ditandai tidak tersedia."}
            {!isIngredient && preview > 0 && current <= 0 && " — menu akan tersedia kembali."}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Batal
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Koreksi"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
