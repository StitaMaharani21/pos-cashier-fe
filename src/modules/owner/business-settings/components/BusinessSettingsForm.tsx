import type { BusinessSettings } from "@/entities/business-settings/model/business-settings.types"
import {
  businessSettingsSchema,
  type BusinessSettingsFormValues,
} from "@/modules/owner/business-settings/schemas/business-settings.schema"
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
import { Textarea } from "@/shared/ui/textarea"

interface BusinessSettingsFormPayload {
  business_name: string
  address: string
  phone_no: string
  email: string
  tax_percentage: number
  receipt_footer: string
}

interface BusinessSettingsFormProps {
  settings: BusinessSettings | null
  isSubmitting: boolean
  onSubmit: (payload: BusinessSettingsFormPayload) => void
}

export function BusinessSettingsForm({
  settings,
  isSubmitting,
  onSubmit,
}: BusinessSettingsFormProps) {
  const form = useCrudForm({
    schema: businessSettingsSchema,
    defaultValues: {
      businessName: settings?.business_name ?? "",
      address: settings?.address ?? "",
      phoneNo: settings?.phone_no ?? "",
      email: settings?.email ?? "",
      taxPercentage: settings?.tax_percentage != null ? String(settings.tax_percentage) : "",
      receiptFooter: settings?.receipt_footer ?? "",
    },
  })

  function handleSubmit(values: BusinessSettingsFormValues) {
    onSubmit({
      business_name: values.businessName,
      address: values.address,
      phone_no: values.phoneNo,
      email: values.email ?? "",
      tax_percentage: values.taxPercentage ? Number(values.taxPercentage) : 0,
      receipt_footer: values.receiptFooter ?? "",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Informasi Bisnis</h2>
          <p className="text-xs text-muted-foreground">
            Detail ini akan tampil pada struk transaksi.
          </p>
        </div>

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Bisnis</FormLabel>
              <FormControl>
                <Input placeholder="Kedai Senja Coffee & Eatery" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Textarea placeholder="Jl. Kenanga No. 12, Bandung, Jawa Barat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="phoneNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="0812-3456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="halo@kedaisenja.id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="taxPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pajak (%)</FormLabel>
              <FormControl>
                <Input type="number" min={0} max={100} className="max-w-40" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Diterapkan otomatis ke setiap transaksi
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiptFooter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan Kaki Struk</FormLabel>
              <FormControl>
                <Textarea placeholder="Terima kasih telah berkunjung ke Kedai Senja!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Batalkan
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
