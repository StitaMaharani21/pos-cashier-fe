import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import type {
  CreateIngredientPayload,
  Ingredient,
  UpdateIngredientPayload,
} from "@/entities/ingredient/model/ingredient.types"
import { INGREDIENT_UNITS } from "@/modules/owner/ingredient/constants/units"
import {
  ingredientSchema,
  type IngredientFormValues,
} from "@/modules/owner/ingredient/schemas/ingredient.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatNumber, formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { LabelWithInfo } from "@/shared/ui/info-tip"
import { Input } from "@/shared/ui/input"
import { NumberInput } from "@/shared/ui/number-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

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
              <LabelWithInfo
                infoLabel="Satuan"
                info={
                  row
                    ? "Satuan tidak bisa diubah karena stok dan resep dihitung dalam satuan ini. Buat bahan baru bila satuannya berbeda."
                    : "Satuan untuk menghitung stok. Pilih dari daftar; tidak bisa diubah setelah disimpan."
                }
              >
                <FormLabel>Satuan</FormLabel>
              </LabelWithInfo>
              {/* A dropdown, not free text: the same unit is always spelled the
                  same way. It is fixed once the ingredient exists — stock and
                  recipes are counted in it, so changing "kg" to "gram" would
                  silently turn 10 kg into 10 gram. */}
              <Select value={field.value} onValueChange={field.onChange} disabled={row != null}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full bg-card">
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* An old free-text unit that is not on the list still shows. */}
                  {field.value && !(INGREDIENT_UNITS as readonly string[]).includes(field.value) && (
                    <SelectItem value={field.value}>{field.value}</SelectItem>
                  )}
                  {INGREDIENT_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <LabelWithInfo
                infoLabel="Stok Minimum"
                info="Saat stok sama atau di bawah angka ini, bahan ditandai “Menipis” di daftar."
              >
                <FormLabel>Stok Minimum</FormLabel>
              </LabelWithInfo>
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
            <InfoRow
              label="Stok saat ini"
              value={`${formatNumber(row.stock ?? 0)} ${row.unit}`}
              info="Stok dan harga beli tidak diubah dari form ini. Gunakan Riwayat Stok → Ubah Stok → Stok Masuk saat barang datang (harga beli ikut tercatat di riwayat harga), atau Koreksi untuk memperbaiki angka stok."
            />
            <InfoRow label="Harga beli terakhir" value={formatRupiah(row.purchase_price ?? 0)} />
            {row.average_cost != null && <InfoRow label="Harga pokok rata-rata" value={formatRupiah(row.average_cost)} />}
            <Link
              to="/app/stock-history"
              target="_blank"
              rel="noreferrer"
              className="w-fit text-xs font-semibold text-primary-strong underline underline-offset-2"
            >
              Kelola di Riwayat Stok
            </Link>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <LabelWithInfo
                  infoLabel="Harga Beli Awal"
                  info={
                    <>
                      <p>
                        Harga untuk <span className="font-semibold text-foreground">satu {form.watch("unit") || "satuan"}</span>
                        , bukan total belanja. Contoh: beli 10 kg seharga Rp105.000 berarti Rp10.500 per kg; kalau
                        satuannya gram, isi 10,5.
                      </p>
                      <p>
                        Hanya diisi di sini sekali. Stok mulai dari 0: isi stok awal lewat Riwayat Stok → Ubah Stok → Stok
                        Masuk, dan harga beli berikutnya ikut di situ.
                      </p>
                    </>
                  }
                >
                  <FormLabel>Harga Beli Awal per {form.watch("unit") || "satuan"} (Rp)</FormLabel>
                </LabelWithInfo>
                <FormControl>
                  <NumberInput decimals={2} maxDigits={12} name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  onValueChange={field.onChange} />
                </FormControl>
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

function InfoRow({ label, value, info }: { label: string; value: string; info?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {info ? (
        <LabelWithInfo infoLabel={label} info={info}>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </LabelWithInfo>
      ) : (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      <span className="text-sm font-bold tabular-nums text-foreground">{value}</span>
    </div>
  )
}
