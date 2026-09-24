import type { Voucher } from "@/entities/voucher/model/voucher.types"
import { voucherSchema, type VoucherFormValues } from "@/modules/owner/voucher/schemas/voucher.schema"
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

interface VoucherFormProps {
  row: Voucher | null
  isSubmitting: boolean
  onSubmit: (values: {
    name: string
    code: string
    type: "percent" | "fixed"
    value: number
    minimum_purchase: number
    start_date: string
    end_date: string
    status: "active" | "inactive"
  }) => void
}

// "YYYY-MM-DDTHH:mm:ssZ" (or any RFC3339 string) -> "YYYY-MM-DD" for
// <input type="date">'s value.
function toDateInputValue(value?: string): string {
  return value ? value.slice(0, 10) : ""
}

export function VoucherForm({ row, isSubmitting, onSubmit }: VoucherFormProps) {
  const form = useCrudForm({
    schema: voucherSchema,
    defaultValues: {
      name: row?.name ?? "",
      code: row?.code ?? "",
      type: (row?.type as "percent" | "fixed") ?? "percent",
      value: row?.value != null ? String(row.value) : "",
      minimumPurchase: row?.minimum_purchase != null ? String(row.minimum_purchase) : "",
      startDate: toDateInputValue(row?.start_date),
      endDate: toDateInputValue(row?.end_date),
      status: (row?.status as "active" | "inactive") ?? "active",
    },
  })

  function handleSubmit(values: VoucherFormValues) {
    onSubmit({
      name: values.name,
      code: values.code,
      type: values.type,
      value: Number(values.value),
      minimum_purchase: values.minimumPurchase ? Number(values.minimumPurchase) : 0,
      start_date: `${values.startDate}T00:00:00Z`,
      end_date: `${values.endDate}T00:00:00Z`,
      status: values.status,
    })
  }

  const type = form.watch("type")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Voucher</FormLabel>
              <FormControl>
                <Input placeholder="Promo Akhir Tahun" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Voucher</FormLabel>
              <FormControl>
                <Input placeholder="AKHIRTAHUN25" className="uppercase" {...field} />
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
                  <Input type="number" min={0} placeholder={type === "percent" ? "10" : "10000"} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimumPurchase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimal Belanja (Rp)</FormLabel>
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
              <p className="text-xs text-muted-foreground">
                Voucher yang sudah pernah dipakai di transaksi tidak bisa dihapus — nonaktifkan
                lewat Status sebagai gantinya.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Menyimpan..." : "Simpan Voucher"}
        </Button>
      </form>
    </Form>
  )
}
