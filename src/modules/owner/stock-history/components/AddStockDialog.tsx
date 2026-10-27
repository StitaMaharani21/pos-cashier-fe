import { useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  addIngredientStock,
  addMenuStock,
} from "@/modules/owner/stock-history/api/stock-history.service"
import type { StockItem } from "@/modules/owner/stock-history/lib/stock-item"
import {
  createAddStockSchema,
  type AddStockFormValues,
} from "@/modules/owner/stock-history/schemas/add-stock.schema"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatNumber } from "@/shared/lib/utils"
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

interface AddStockDialogProps {
  // null = closed.
  item: StockItem | null
  onOpenChange: (open: boolean) => void
}

// "Tambah Stok": goods received for a bahan baku (jumlah, harga beli per
// satuan, keterangan) or a menu tracked per item (jumlah, keterangan). Saves
// straight to the server and shows up in Riwayat Stok as "Stok masuk" — unlike
// "Sesuaikan stok", which is a correction (Penyesuaian) that can also go down.
export function AddStockDialog({ item, onOpenChange }: AddStockDialogProps) {
  return (
    <Dialog open={item != null} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* Mounted only while open, so every open starts from fresh defaults. */}
        {item && <AddStockForm item={item} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function AddStockForm({ item, onDone }: { item: StockItem; onDone: () => void }) {
  const queryClient = useQueryClient()
  const isIngredient = item.source === "ingredient"
  const schema = useMemo(() => createAddStockSchema({ wholeNumber: !isIngredient }), [isIngredient])
  const form = useCrudForm({
    schema,
    defaultValues: {
      qty: "",
      purchasePrice: isIngredient && item.purchasePrice ? String(item.purchasePrice) : "",
      keterangan: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: AddStockFormValues) => {
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
      queryClient.invalidateQueries({ queryKey: ["ingredients"] })
      queryClient.invalidateQueries({ queryKey: ["menus"] })
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] })
      queryClient.invalidateQueries({ queryKey: ["stock-reconciliation"] })
      onDone()
    },
    onError: (error) => toast.error(error instanceof CrudServiceError ? error.message : "Terjadi kesalahan"),
  })

  const qty = Number(form.watch("qty"))
  const current = item.stock ?? 0
  const preview = Number.isFinite(qty) && qty > 0 ? current + qty : null

  return (
    <>
      <DialogHeader>
        <DialogTitle>Tambah Stok — {item.name}</DialogTitle>
        <DialogDescription>
          Stok saat ini: {item.stock == null ? "belum diisi" : `${formatNumber(item.stock)} ${item.unit}`}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Masuk ({item.unit})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={isIngredient ? "any" : 1}
                    inputMode={isIngredient ? "decimal" : "numeric"}
                    placeholder={isIngredient ? "mis. 10" : "mis. 20"}
                    autoFocus
                    {...field}
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
                    <Input type="number" min={0} step="any" inputMode="decimal" placeholder="Opsional" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Diisi dengan harga beli saat ini. Ubah bila harga berubah, atau kosongkan agar harga beli tidak diubah.
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
                  <Textarea placeholder="mis. Belanja di pasar, atau barang datang dari supplier" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {preview != null && (
            <p className="text-sm text-muted-foreground">
              Stok setelah ditambah:{" "}
              <span className="font-semibold text-foreground">{formatNumber(preview)}</span> {item.unit}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
