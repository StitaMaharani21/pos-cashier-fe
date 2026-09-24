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
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"

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
      stock: row?.stock != null ? String(row.stock) : "0",
      minStock: row?.min_stock != null ? String(row.min_stock) : "5",
      purchasePrice: row?.purchase_price != null ? String(row.purchase_price) : "0",
    },
  })

  function handleSubmit(values: IngredientFormValues) {
    onSubmit({
      name: values.name,
      unit: values.unit,
      stock: Number(values.stock),
      min_stock: values.minStock ? Number(values.minStock) : 0,
      purchase_price: values.purchasePrice ? Number(values.purchasePrice) : 0,
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stok {row ? "Saat Ini" : "Awal"}</FormLabel>
              <FormControl>
                <Input type="number" min={0} step="any" {...field} />
              </FormControl>
              {row && (
                <p className="text-xs text-muted-foreground">
                  Mengubah nilai ini menimpa stok secara langsung. Untuk menambah stok tanpa
                  menghitung manual, gunakan tombol &quot;Tambah Stok&quot; pada tabel.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Minimum</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Menyimpan..." : "Simpan Bahan Baku"}
        </Button>
      </form>
    </Form>
  )
}
