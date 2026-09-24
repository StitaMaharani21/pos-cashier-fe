import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import {
  menuCategorySchema,
  type MenuCategoryFormValues,
} from "@/modules/owner/menu-category/schemas/menu-category.schema"
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
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"

interface MenuCategoryFormProps {
  row: MenuCategory | null
  isSubmitting: boolean
  onSubmit: (values: { name: string; description: string; sort_order: number; status: string }) => void
}

export function MenuCategoryForm({ row, isSubmitting, onSubmit }: MenuCategoryFormProps) {
  const form = useCrudForm({
    schema: menuCategorySchema,
    defaultValues: {
      name: row?.name ?? "",
      description: row?.description ?? "",
      sortOrder: row?.sort_order != null ? String(row.sort_order) : "",
      status: (row?.status as "active" | "inactive") ?? "active",
    },
  })

  function handleSubmit(values: MenuCategoryFormValues) {
    onSubmit({
      name: values.name,
      description: values.description ?? "",
      sort_order: values.sortOrder ? Number(values.sortOrder) : 0,
      status: values.status,
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
              <FormLabel>Nama Kategori</FormLabel>
              <FormControl>
                <Input placeholder="Menu Musiman" {...field} />
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
                <Textarea placeholder="Menu edisi terbatas untuk musim tertentu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urutan Tampilan</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
        </Button>
      </form>
    </Form>
  )
}
