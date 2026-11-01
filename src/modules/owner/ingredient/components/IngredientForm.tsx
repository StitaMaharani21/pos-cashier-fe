import type {
  CreateIngredientPayload,
  Ingredient,
  UpdateIngredientPayload,
} from "@/entities/ingredient/model/ingredient.types"
import {
  ingredientSchema,
  type IngredientFormValues,
} from "@/modules/owner/ingredient/schemas/ingredient.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatNumber, formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { NumberInput } from "@/shared/ui/number-input"

// No backend enum for unit — this is just a UX nicety via <datalist>, still
// free text underneath (Ingredient.unit is a plain string column).
const UNIT_SUGGESTIONS = ["gram", "kg", "ml", "liter", "pcs", "dus", "box"]

interface IngredientFormProps {
  row: Ingredient | null
  isSubmitting: boolean
  onSubmit: (payload: CreateIngredientPayload | UpdateIngredientPayload) => void
}

export function IngredientForm({ row, isSubmitting, onSubmit }: IngredientFormProps) {
  const form = useCrudForm({
    schema: ingredientSchema,
    defaultValues: {
      name: row?.name ?? "",
      unit: row?.unit ?? "",
      minStock: row?.min_stock != null ? String(row.min_stock) : "5",
      purchasePrice: row?.purchase_price != null ? String(row.purchase_price) : "0",
    },
  })

  function handleSubmit(values: IngredientFormValues) {
    onSubmit({
      name: values.name,
      unit: values.unit,
      min_stock: values.minStock ? Number(values.minStock) : 0,
      // Opening purchase price, set once at creation. Afterwards it only changes
      // through "Stok Masuk" (so the average cost and the price history follow
      // real purchases); the backend ignores it on edit.
      ...(row ? {} : { purchase_price: values.purchasePrice ? Number(values.purchasePrice) : 0 }),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Bahan</FormLabel>
              <FormControl>
                <Input placeholder="Biji Kopi Arabika" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satuan</FormLabel>
              <FormControl>
                <Input list="ingredient-unit-suggestions" placeholder="gram" {...field} />
              </FormControl>
              <datalist id="ingredient-unit-suggestions">
                {UNIT_SUGGESTIONS.map((unit) => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                Nama satuan untuk menghitung stok (mis. gram, kg, ml, pcs), bukan angka.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stok Minimum</FormLabel>
              <FormControl>
                <NumberInput decimals={3} maxDigits={9} name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ?? ""}
                onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {row ? (
          <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-3.5">
            <InfoRow label="Stok saat ini" value={`${formatNumber(row.stock ?? 0)} ${row.unit}`} />
            <InfoRow label="Harga beli terakhir" value={formatRupiah(row.purchase_price ?? 0)} />
            {row.average_cost != null && <InfoRow label="Harga pokok rata-rata" value={formatRupiah(row.average_cost)} />}
            <p className="text-xs text-muted-foreground">
              Stok dan harga beli tidak diubah dari form ini. Gunakan Riwayat Stok → Ubah Stok → Stok Masuk saat barang
              datang (harga beli ikut tercatat di riwayat harga), atau Koreksi untuk memperbaiki angka stok.
            </p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli Awal</FormLabel>
                <FormControl>
                  <NumberInput decimals={2} maxDigits={12} name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  onValueChange={field.onChange} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Hanya diisi di sini sekali. Stok mulai dari 0: isi stok awal lewat Riwayat Stok → Ubah Stok → Stok Masuk,
                  dan harga beli berikutnya ikut di situ.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Menyimpan..." : "Simpan Bahan Baku"}
        </Button>
      </form>
    </Form>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}
