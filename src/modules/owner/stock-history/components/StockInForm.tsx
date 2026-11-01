import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { addIngredientStock, addMenuStock } from "@/modules/owner/stock-history/api/stock-history.service"
import { nextAverageCost } from "@/modules/owner/stock-history/lib/average-cost"
import { invalidateStockQueries } from "@/modules/owner/stock-history/lib/invalidate-stock"
import type { StockItem } from "@/modules/owner/stock-history/lib/stock-item"
import {
  createStockInSchema,
  type StockInFormValues,
} from "@/modules/owner/stock-history/schemas/stock-change.schema"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatNumber, formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { DialogFooter } from "@/shared/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { NumberInput } from "@/shared/ui/number-input"
import { Textarea } from "@/shared/ui/textarea"

// "Stok Masuk": goods received for a bahan baku (jumlah, harga beli per satuan,
// keterangan) or a menu counted per item (jumlah, keterangan). Also how a new
// item gets its first stock. Shows up in Riwayat Stok as "Stok masuk".
export function StockInForm({ item, onDone }: { item: StockItem; onDone: () => void }) {
  const queryClient = useQueryClient()
  const isIngredient = item.source === "ingredient"
  const schema = useMemo(() => createStockInSchema({ wholeNumber: !isIngredient }), [isIngredient])
  const form = useCrudForm({
    schema,
    defaultValues: {
      qty: "",
      purchasePrice: isIngredient && item.purchasePrice ? String(item.purchasePrice) : "",
      keterangan: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: StockInFormValues) => {
      const keterangan = values.keterangan || undefined
      const qty = Number(values.qty)
      return isIngredient
        ? addIngredientStock(item.id, {
            qty,
            purchase_price: values.purchasePrice === "" ? undefined : Number(values.purchasePrice),
            keterangan,
          })
        : addMenuStock(item.id, { qty, keterangan })
    },
    onSuccess: () => {
      toast.success("Stok ditambahkan")
      invalidateStockQueries(queryClient)
      onDone()
    },
    onError: (error) => toast.error(error instanceof CrudServiceError ? error.message : "Stok belum berhasil ditambahkan. Coba lagi."),
  })

  const qty = Number(form.watch("qty"))
  const typedPrice = form.watch("purchasePrice")
  const current = item.stock ?? 0
  const validQty = Number.isFinite(qty) && qty > 0
  const preview = validQty ? current + qty : null

  // The average cost the stock will have after this purchase (bahan baku only).
  const price = typedPrice === "" || !Number.isFinite(Number(typedPrice)) ? (item.purchasePrice ?? 0) : Number(typedPrice)
  const averageAfter =
    isIngredient && validQty
      ? nextAverageCost({
          stockBefore: current,
          average: item.averageCost ?? 0,
          fallback: item.purchasePrice ?? 0,
          qty,
          price,
        })
      : null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="qty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Masuk ({item.unit})</FormLabel>
              <FormControl>
                <NumberInput
                  decimals={isIngredient ? 3 : 0}
                  maxDigits={9}
                  placeholder={isIngredient ? "mis. 10" : "mis. 20"}
                  autoFocus
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

        {isIngredient && (
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli per {item.unit} (Rp)</FormLabel>
                <FormControl>
                  <NumberInput
                    decimals={2}
                    maxDigits={12}
                    placeholder="Opsional"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Harga barang yang datang ini. Dipakai menghitung harga pokok rata-rata untuk laporan laba; perubahannya tercatat
                  di riwayat harga. Kosongkan agar memakai harga beli terakhir.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="keterangan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keterangan (opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="mis. Stok awal, belanja di pasar, atau barang datang dari pemasok" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {preview != null && (
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              Stok setelah ditambah: <span className="font-semibold text-foreground">{formatNumber(preview)}</span> {item.unit}
              {!isIngredient && current <= 0 && preview > 0 && " — menu akan tersedia kembali."}
            </p>
            {averageAfter != null && (
              <p>
                Harga pokok rata-rata setelahnya:{" "}
                <span className="font-semibold text-foreground">{formatRupiah(Math.round(averageAfter * 100) / 100)}</span> per {item.unit}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Batal
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Menyimpan..." : "Simpan Stok Masuk"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
