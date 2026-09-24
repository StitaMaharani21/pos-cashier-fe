import { useQuery } from "@tanstack/react-query"

import type { Menu } from "@/entities/menu/model/menu.types"
import type { ProductDiscount } from "@/entities/product-discount/model/product-discount.types"
import {
  productDiscountSchema,
  type ProductDiscountFormValues,
} from "@/modules/owner/product-discount/schemas/product-discount.schema"
import { apiClient } from "@/shared/api/client"
import type { PaginatedResponse } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface ProductDiscountFormProps {
  row: ProductDiscount | null
  isSubmitting: boolean
  onSubmit: (values: {
    name: string
    type: "percent" | "fixed"
    value: number
    minimum_qty: number
    start_date: string
    end_date: string
    status: "active" | "inactive"
    menu_ids: number[]
  }) => void
}

// "YYYY-MM-DDTHH:mm:ssZ" (or any RFC3339 string) -> "YYYY-MM-DD" for
// <input type="date">'s value.
function toDateInputValue(value?: string): string {
  return value ? value.slice(0, 10) : ""
}

// Self-contained fetch, mirroring RecipeManager.tsx's own
// listAllIngredients() idiom — keeps this component independent of the
// menu module's own paginated service.
async function listAllMenus(): Promise<Menu[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Menu>>("/master/menus", {
      params: { page: 1, per_page: 100 },
    })
    return response.data.data
  } catch (error) {
    console.error("Failed to list menus for product discount picker", error)
    return []
  }
}

export function ProductDiscountForm({ row, isSubmitting, onSubmit }: ProductDiscountFormProps) {
  const { data: menus = [] } = useQuery({
    queryKey: ["menus", "all"],
    queryFn: listAllMenus,
  })

  const form = useCrudForm({
    schema: productDiscountSchema,
    defaultValues: {
      name: row?.name ?? "",
      type: (row?.type as "percent" | "fixed") ?? "percent",
      value: row?.value != null ? String(row.value) : "",
      minimumQty: row?.minimum_qty != null ? String(row.minimum_qty) : "",
      startDate: toDateInputValue(row?.start_date),
      endDate: toDateInputValue(row?.end_date),
      status: (row?.status as "active" | "inactive") ?? "active",
      menuIds: row?.menus?.map((m) => m.menu_id ?? 0) ?? [],
    },
  })

  function handleSubmit(values: ProductDiscountFormValues) {
    onSubmit({
      name: values.name,
      type: values.type,
      value: Number(values.value),
      minimum_qty: values.minimumQty ? Number(values.minimumQty) : 0,
      start_date: `${values.startDate}T00:00:00Z`,
      end_date: `${values.endDate}T00:00:00Z`,
      status: values.status,
      menu_ids: values.menuIds,
    })
  }

  const type = form.watch("type")

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Diskon</FormLabel>
              <FormControl>
                <Input placeholder="Diskon Menu Kopi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Diskon</FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={field.value === "percent" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => field.onChange("percent")}
                >
                  Persen (%)
                </Button>
                <Button
                  type="button"
                  variant={field.value === "fixed" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => field.onChange("fixed")}
                >
                  Nominal (Rp)
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nilai Diskon {type === "percent" ? "(%)" : "(Rp)"}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder={type === "percent" ? "10" : "5000"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumQty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimal Qty</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Mulai</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Berakhir</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="menuIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Menu yang Kena Diskon</FormLabel>
              <div className="max-h-48 overflow-y-auto rounded-md border p-2">
                {menus.length === 0 && (
                  <p className="p-2 text-sm text-muted-foreground">Belum ada menu.</p>
                )}
                {menus.map((menu) => {
                  const menuId = menu.id ?? 0
                  const checked = field.value.includes(menuId)
                  return (
                    <label
                      key={menuId}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          field.onChange(
                            value
                              ? [...field.value, menuId]
                              : field.value.filter((id) => id !== menuId)
                          )
                        }}
                      />
                      {menu.name}
                    </label>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Menyimpan..." : "Simpan Diskon"}
        </Button>
      </form>
    </Form>
  )
}
