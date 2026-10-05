import type { Table } from "@/entities/table/model/table.types"
import { tableSchema, type TableFormValues } from "@/modules/owner/table/schemas/table.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

interface TableFormProps {
  row: Table | null
  isSubmitting: boolean
  onSubmit: (values: TableFormValues) => void
  onCancel: () => void
}

export function TableForm({ row, isSubmitting, onSubmit, onCancel }: TableFormProps) {
  const form = useCrudForm<TableFormValues>({
    schema: tableSchema,
    defaultValues: {
      number: row?.number ?? "",
      status: row?.status === "inactive" ? "inactive" : "active",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Meja</FormLabel>
              <FormControl>
                <Input placeholder="12" maxLength={10} autoFocus {...field} />
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
            {isSubmitting ? "Menyimpan..." : "Simpan Meja"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
