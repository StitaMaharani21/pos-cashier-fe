import { useState } from "react"
import {
  BoxIcon,
  CameraIcon,
  CircleCheckIcon,
  ClockIcon,
  FileTextIcon,
  InfoIcon,
  LockIcon,
  SlidersHorizontalIcon,
  StarIcon,
  WalletIcon,
} from "lucide-react"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import type {
  CreateMenuFormPayload,
  UpdateMenuFormPayload,
} from "@/modules/owner/menu/api/menu.service"
import { DESCRIPTION_MAX, menuSchema, type MenuFormValues } from "@/modules/owner/menu/schemas/menu.schema"
import { RecipeManager } from "@/modules/owner/recipe/components/RecipeManager"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { upsellStore } from "@/shared/access/upsellStore"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { FormSection, RequiredMark } from "@/shared/ui/form-section"
import { ImageDropzone } from "@/shared/ui/image-dropzone"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { Textarea } from "@/shared/ui/textarea"

interface MenuFormProps {
  row: Menu | null
  categories: MenuCategory[]
  isSubmitting: boolean
  onSubmit: (payload: CreateMenuFormPayload | UpdateMenuFormPayload) => void
  onCancel: () => void
}

const thousands = new Intl.NumberFormat("id-ID")

const Section = FormSection
const Required = RequiredMark

// Add/edit menu, laid out as the design's cards: Foto, Informasi Dasar,
// Harga & Penyajian, Stok, Pengaturan Tampilan — body scrolls, the
// Batal / Simpan footer stays put.
export function MenuForm({ row, categories, isSubmitting, onSubmit, onCancel }: MenuFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const { hasFeature, upgradeHint } = useCapabilities()
  // "Per bahan baku (resep)" needs Pro/Enterprise or Starter+addon Inventori
  // (entitlement.FeatInventory on the backend) — /master/ingredients and
  // /master/recipes already 403 for a plain Starter store, and the menu
  // create/update endpoint itself rejects stock_deduction_method=
  // by_ingredient with a 402 too. This just surfaces that upfront.
  const canUseIngredientStock = hasFeature("inventory_full")

  const form = useCrudForm({
    schema: menuSchema,
    defaultValues: {
      categoryId: row?.category_id != null ? String(row.category_id) : "",
      code: row?.code ?? "",
      name: row?.name ?? "",
      description: row?.description ?? "",
      price: row?.price != null ? String(Math.round(row.price)) : "",
      preparationTime: row?.preparation_time ? String(row.preparation_time) : "",
      isAvailable: row?.is_available ?? true,
      isFeatured: row?.is_featured ?? false,
      stockDeductionMethod:
        (row?.stock_deduction_method as MenuFormValues["stockDeductionMethod"]) ?? "none",
      stockQty: row?.stock_qty != null ? String(row.stock_qty) : "",
    },
  })

  const stockDeductionMethod = form.watch("stockDeductionMethod")
  const description = form.watch("description") ?? ""
  const tracked = stockDeductionMethod !== "none"

  function setStockMethod(method: MenuFormValues["stockDeductionMethod"]) {
    if (method === "by_ingredient" && !canUseIngredientStock) {
      upsellStore.open("inventory_full", upgradeHint("inventory_full"))
      return
    }
    form.setValue("stockDeductionMethod", method, { shouldValidate: form.formState.isSubmitted })
  }

  function handleSubmit(values: MenuFormValues) {
    // The backend requires a photo on create (edit keeps the current one).
    if (!row && !imageFile) {
      setImageError("Foto menu wajib diunggah")
      return
    }
    setImageError(null)
    onSubmit({
      category_id: Number(values.categoryId),
      code: values.code,
      name: values.name,
      description: values.description ?? "",
      price: Number(values.price),
      preparation_time: values.preparationTime ? Number(values.preparationTime) : 0,
      is_available: values.isAvailable,
      is_featured: values.isFeatured,
      image: imageFile as File,
      stock_deduction_method: values.stockDeductionMethod,
      stock_qty:
        values.stockDeductionMethod === "by_menu" && values.stockQty
          ? Number(values.stockQty)
          : undefined,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, () => {
          // Show the missing-photo error alongside the field errors, not
          // only after everything else is valid.
          if (!row && !imageFile) setImageError("Foto menu wajib diunggah")
        })}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <Section icon={CameraIcon} title="Foto Menu" description="Foto akan tampil di daftar menu & aplikasi pelanggan">
            <ImageDropzone
              value={row?.image_url}
              onChange={(file) => {
                setImageFile(file)
                setImageError(null)
              }}
              hint="PNG, JPG, WEBP · maks 2MB · rekomendasi 800×600px"
              error={imageError}
            />
          </Section>

          <Section icon={FileTextIcon} title="Informasi Dasar" description="Nama dan kategori yang tampil di menu">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Menu
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Cappuccino Gula Aren" className="h-11 bg-card" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Same grid/label metrics as the FormItem beside it. */}
              <div className="grid gap-2">
                <label htmlFor="menu-code" className="flex items-center gap-2 text-sm leading-none font-medium text-foreground">
                  Kode Menu
                </label>
                <div className="relative">
                  <Input
                    id="menu-code"
                    value={row?.code || "Otomatis"}
                    readOnly
                    disabled
                    className="h-11 bg-muted pr-10"
                  />
                  <LockIcon className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {row ? "Kode tidak dapat diubah" : "Dibuat otomatis saat disimpan"}
                </p>
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kategori
                      <Required />
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full bg-card">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder="Ketik deskripsi menu di sini..."
                        maxLength={DESCRIPTION_MAX}
                        className="min-h-24 resize-none bg-card pb-7"
                        {...field}
                      />
                    </FormControl>
                    <span className="pointer-events-none absolute right-3 bottom-2 text-xs text-muted-foreground">
                      {description.length}/{DESCRIPTION_MAX}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section icon={WalletIcon} title="Harga & Penyajian" description="Atur harga jual dan estimasi waktu penyajian">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Harga
                      <Required />
                    </FormLabel>
                    <div className="flex h-11 overflow-hidden rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                      <span className="flex items-center border-r bg-muted px-3.5 text-sm text-muted-foreground">Rp</span>
                      <FormControl>
                        <input
                          inputMode="numeric"
                          placeholder="0"
                          className="w-full min-w-0 bg-transparent px-3 text-right text-sm outline-none"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          // Stored as plain digits, shown as "28.000".
                          value={field.value ? thousands.format(Number(field.value)) : ""}
                          onChange={(event) => field.onChange(event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""))}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Penyajian</FormLabel>
                    <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                      <ClockIcon className="size-4 shrink-0 text-muted-foreground" />
                      <FormControl>
                        <input
                          inputMode="numeric"
                          placeholder="0"
                          className="w-full min-w-0 bg-transparent text-sm outline-none"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">menit</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          <Section icon={BoxIcon} title="Stok" description="Pantau ketersediaan stok menu">
            <div role="radiogroup" aria-label="Pelacakan stok" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
              {[
                { value: false, label: "Tidak dilacak" },
                { value: true, label: "Lacak stok" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={tracked === option.value}
                  onClick={() => setStockMethod(option.value ? (tracked ? stockDeductionMethod : "by_menu") : "none")}
                  className={cn(
                    "rounded-lg py-2 text-sm font-semibold transition-all",
                    tracked === option.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {tracked && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { value: "by_menu" as const, label: "Per menu (satuan)", hint: "Stok dihitung per porsi/item" },
                  { value: "by_ingredient" as const, label: "Per bahan baku (resep)", hint: "Mengurangi stok bahan sesuai resep" },
                ].map((option) => {
                  const selected = stockDeductionMethod === option.value
                  const locked = option.value === "by_ingredient" && !canUseIngredientStock
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setStockMethod(option.value)}
                      className={cn(
                        "flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-colors",
                        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card hover:bg-muted/50"
                      )}
                    >
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        {option.label}
                        {locked && <LockIcon className="size-3.5 text-muted-foreground" />}
                      </span>
                      <span className="text-xs text-muted-foreground">{option.hint}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {stockDeductionMethod === "by_menu" && (
              <FormField
                control={form.control}
                name="stockQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jumlah Stok
                      <Required />
                    </FormLabel>
                    <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                      <FormControl>
                        <input
                          inputMode="numeric"
                          placeholder="0"
                          className="w-full min-w-0 bg-transparent text-sm outline-none"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ""))}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">pcs</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {stockDeductionMethod === "by_ingredient" &&
              (row?.id != null ? (
                <RecipeManager menuId={row.id} />
              ) : (
                <p className="rounded-lg border border-dashed bg-card p-3 text-xs text-muted-foreground">
                  Simpan menu ini terlebih dahulu untuk menambahkan resep bahan baku.
                </p>
              ))}

            <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-primary">
              <InfoIcon className="mt-0.5 size-4 shrink-0" />
              {stockDeductionMethod === "none" && "Menu selalu dianggap tersedia tanpa batas stok."}
              {stockDeductionMethod === "by_menu" &&
                "Stok berkurang 1 setiap kali terjual — cocok untuk item satuan seperti kue atau minuman kemasan. Batas stok menipis (default 5) belum bisa diatur dari sini."}
              {stockDeductionMethod === "by_ingredient" &&
                "Stok bahan baku berkurang otomatis sesuai resep setiap menu ini terjual — cocok untuk item racikan."}
            </p>
          </Section>

          <Section icon={SlidersHorizontalIcon} title="Pengaturan Tampilan" description="Atur bagaimana menu tampil ke pelanggan">
            <div className="flex flex-col divide-y">
              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 pb-4">
                    <CircleCheckIcon className="size-5 shrink-0 text-primary" />
                    <div className="flex-1">
                      <FormLabel className="text-sm font-semibold">Tersedia</FormLabel>
                      <p className="text-xs text-muted-foreground">Menu bisa dipesan pelanggan</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 pt-4">
                    <StarIcon className="size-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1">
                      <FormLabel className="text-sm font-semibold">Tandai sebagai Unggulan</FormLabel>
                      <p className="text-xs text-muted-foreground">Tampil di bagian rekomendasi</p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Section>
        </div>

        <div className="flex justify-end gap-2.5 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Menu"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
