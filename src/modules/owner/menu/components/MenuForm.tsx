import { useState } from "react"
import { LockIcon } from "lucide-react"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import type {
  CreateMenuFormPayload,
  UpdateMenuFormPayload,
} from "@/modules/owner/menu/api/menu.service"
import { menuSchema, type MenuFormValues } from "@/modules/owner/menu/schemas/menu.schema"
import { RecipeManager } from "@/modules/owner/recipe/components/RecipeManager"
import { useCapabilities } from "@/shared/access/useCapabilities"
import { upsellStore } from "@/shared/access/upsellStore"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { ImageUpload } from "@/shared/ui/image-upload"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import { Textarea } from "@/shared/ui/textarea"

interface MenuFormProps {
  row: Menu | null
  categories: MenuCategory[]
  isSubmitting: boolean
  onSubmit: (payload: CreateMenuFormPayload | UpdateMenuFormPayload) => void
  onCancel: () => void
}

export function MenuForm({ row, categories, isSubmitting, onSubmit, onCancel }: MenuFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const { hasFeature, upgradeHint } = useCapabilities()
  // "Per Bahan Baku (Resep)" needs Pro/Enterprise or Starter+addon Inventori
  // (entitlement.FeatInventory on the backend) — /master/ingredients and
  // /master/recipes already 403 for a plain Starter store, and the menu
  // create/update endpoint itself now rejects stock_deduction_method=
  // by_ingredient with a 402 too. This just surfaces that upfront instead of
  // letting the owner pick it and hit a confusing error later.
  const canUseIngredientStock = hasFeature("inventory_full")

  const form = useCrudForm({
    schema: menuSchema,
    defaultValues: {
      categoryId: row?.category_id != null ? String(row.category_id) : "",
      code: row?.code ?? "",
      name: row?.name ?? "",
      description: row?.description ?? "",
      price: row?.price != null ? String(row.price) : "",
      preparationTime: row?.preparation_time != null ? String(row.preparation_time) : "",
      isAvailable: row?.is_available ?? true,
      isFeatured: row?.is_featured ?? false,
      stockDeductionMethod:
        (row?.stock_deduction_method as MenuFormValues["stockDeductionMethod"]) ?? "none",
      stockQty: row?.stock_qty != null ? String(row.stock_qty) : "",
    },
  })

  const stockDeductionMethod = form.watch("stockDeductionMethod")

  function handleSubmit(values: MenuFormValues) {
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
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 flex-col gap-4 overflow-y-auto"
      >
        <div className="flex flex-col gap-2">
          <ImageUpload
            value={row?.image_url}
            onChange={(file) => {
              setImageFile(file)
              if (file) setImageError(null)
            }}
            placeholder="Klik untuk unggah foto menu"
          />
          {imageError && <p className="text-sm text-destructive">{imageError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Menu</FormLabel>
                <FormControl>
                  <Input placeholder="MNU-049" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Menu</FormLabel>
              <FormControl>
                <Input placeholder="Cappuccino Gula Aren" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea placeholder="Espresso, susu steam, gula aren" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="28000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preparationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimasi Penyajian (menit)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="stockDeductionMethod"
          render={({ field }) => (
            <FormItem className="border-t pt-3">
              <FormLabel>Manajemen Stok</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (value === "by_ingredient" && !canUseIngredientStock) {
                    upsellStore.open("inventory_full", upgradeHint("inventory_full"))
                    return
                  }
                  field.onChange(value)
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Tidak Dilacak</SelectItem>
                  <SelectItem value="by_menu">Per Menu (Satuan)</SelectItem>
                  <SelectItem value="by_ingredient">
                    <span className="flex items-center gap-1.5">
                      Per Bahan Baku (Resep)
                      {!canUseIngredientStock && (
                        <LockIcon className="size-3 text-muted-foreground/60" />
                      )}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {stockDeductionMethod === "by_menu" &&
                  "Stok dilacak langsung pada menu ini, berkurang 1 setiap kali terjual — cocok untuk item satuan (mis. kue, minuman kemasan)."}
                {stockDeductionMethod === "by_ingredient" &&
                  "Stok bahan baku berkurang otomatis sesuai resep setiap menu ini terjual — cocok untuk item racikan (mis. Cafe Latte butuh biji kopi dan susu)."}
                {stockDeductionMethod === "none" && "Stok menu ini tidak dilacak sama sekali."}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {stockDeductionMethod === "by_menu" && (
          <FormField
            control={form.control}
            name="stockQty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jumlah Stok</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="50" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Ambang batas &quot;stok menipis&quot; (default 5) belum bisa diatur dari sini —
                  keterbatasan API saat ini.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {stockDeductionMethod === "by_ingredient" &&
          (!canUseIngredientStock ? (
            <p className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              <LockIcon className="size-3.5 shrink-0" />
              Resep bahan baku memerlukan paket Pro, Enterprise, atau addon Inventori di Starter.
            </p>
          ) : row?.id != null ? (
            <RecipeManager menuId={row.id} />
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Simpan menu ini terlebih dahulu untuk menambahkan resep bahan baku.
            </p>
          ))}

        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between border-t py-3">
              <FormLabel className="text-sm font-semibold">Tersedia</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between border-t py-3">
              <FormLabel className="text-sm font-semibold">Tandai sebagai Unggulan</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="mt-auto flex gap-2.5 border-t pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Menyimpan..." : "Simpan Menu"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
