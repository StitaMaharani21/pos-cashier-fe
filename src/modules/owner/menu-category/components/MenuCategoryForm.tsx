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

export interface MenuCategoryFormPayload {
  name: string
  description: string
  status: string
}

interface MenuCategoryFormProps {
  row: MenuCategory | null
  isSubmitting: boolean
  onSubmit: (values: MenuCategoryFormPayload) => void
  onCancel: () => void
}

// No "urutan" field: order is set by dragging rows in the table
// (PUT /master/menu-categories/reorder). The backend puts a new category
// last and leaves the order alone on edit when sort_order isn't sent.
export function MenuCategoryForm({ row, isSubmitting, onSubmit, onCancel }: MenuCategoryFormProps) {
  const form = useCrudForm({
    schema: menuCategorySchema,
    defaultValues: {
      name: row?.name ?? "",
      description: row?.description ?? "",
      status: (row?.status as "active" | "inactive") ?? "active",
    },
  })

  function handleSubmit(values: MenuCategoryFormValues) {
    onSubmit({
      name: values.name,
      description: values.description ?? "",
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
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

        <div className="flex gap-2.5 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
