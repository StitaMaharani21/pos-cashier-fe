import { CalendarRangeIcon, PercentIcon, ShuffleIcon, TicketIcon } from "lucide-react"

import type { CreateVoucherPayload, Voucher } from "@/entities/voucher/model/voucher.types"
import { AffixInput } from "@/modules/owner/discount-form/components/AffixInput"
import { DiscountValueFields } from "@/modules/owner/discount-form/components/DiscountValueFields"
import { DrawerFooter } from "@/modules/owner/discount-form/components/DrawerFooter"
import { NameStatusFields } from "@/modules/owner/discount-form/components/NameStatusFields"
import { PeriodFields } from "@/modules/owner/discount-form/components/PeriodFields"
import { SummaryBanner } from "@/modules/owner/discount-form/components/SummaryBanner"
import {
  describePeriodInline,
  describeValue,
  fromApiDate,
  randomVoucherCode,
  toApiDate,
  todayInput,
} from "@/modules/owner/discount-form/lib/discount-rules"
import { voucherSchema, type VoucherFormValues } from "@/modules/owner/voucher/schemas/voucher.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { FormSection, RequiredMark } from "@/shared/ui/form-section"
import { Input } from "@/shared/ui/input"

interface VoucherFormProps {
  row: Voucher | null
  isSubmitting: boolean
  onSubmit: (payload: CreateVoucherPayload) => void
  onCancel: () => void
  onDelete?: () => void
  isDeleting: boolean
}

// The "Tambah Voucher" drawer — same cards as diskon otomatis, with the
// voucher's own fields: a code the cashier types, a minimum spend on the
// order total, no menu picker and no day/hour schedule.
export function VoucherForm({ row, isSubmitting, onSubmit, onCancel, onDelete, isDeleting }: VoucherFormProps) {
  const form = useCrudForm({
    schema: voucherSchema,
    defaultValues: {
      name: row?.name ?? "",
      code: row?.code ?? "",
      isActive: (row?.status ?? "active") === "active",
      type: (row?.type as "percent" | "fixed") ?? "percent",
      value: row?.value != null ? String(row.value) : "",
      maxDiscount: row?.max_discount ? String(Math.round(row.max_discount)) : "",
      minimumPurchase: row?.minimum_purchase ? String(Math.round(row.minimum_purchase)) : "",
      startDate: row ? fromApiDate(row.start_date) : todayInput(),
      endDate: row ? fromApiDate(row.end_date) : todayInput(29),
    },
  })

  const values = form.watch()
  const rule = {
    type: values.type,
    value: Number(values.value) || 0,
    maxDiscount: values.type === "percent" ? Number(values.maxDiscount) || 0 : 0,
  }
  const minimum = Number(values.minimumPurchase) || 0

  function handleSubmit(submitted: VoucherFormValues) {
    onSubmit({
      name: submitted.name.trim(),
      code: submitted.code.trim(),
      type: submitted.type,
      value: Number(submitted.value),
      max_discount: submitted.type === "percent" && submitted.maxDiscount ? Number(submitted.maxDiscount) : 0,
      minimum_purchase: submitted.minimumPurchase ? Number(submitted.minimumPurchase) : 0,
      start_date: toApiDate(submitted.startDate),
      // Omitted = never expires.
      end_date: submitted.endDate ? toApiDate(submitted.endDate) : undefined,
      status: submitted.isActive ? "active" : "inactive",
    })
  }

  const summaryLines = [
    `Kode ${values.code || "—"} memotong ${describeValue(rule)} dari total belanja${
      minimum > 0 ? ` minimal ${formatRupiah(minimum)}` : ""
    }.`,
    `Berlaku ${describePeriodInline(values.startDate, values.endDate)}.`,
    values.isActive ? "Dihitung setelah diskon otomatis per menu." : "Disimpan nonaktif — kode belum bisa dipakai.",
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <FormSection icon={TicketIcon} title="Informasi Voucher" description="Nama dan kode yang dimasukkan kasir saat transaksi">
            <NameStatusFields
              nameLabel="Nama Voucher"
              namePlaceholder="Contoh: Promo Gajian"
              statusHint="Voucher yang sudah dipakai di transaksi tidak bisa dihapus — nonaktifkan saja"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kode Voucher
                      <RequiredMark />
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="GAJIAN25"
                          maxLength={50}
                          autoCapitalize="characters"
                          className="h-11 bg-card font-mono tracking-wider uppercase"
                          {...field}
                          onChange={(event) => field.onChange(event.target.value.toUpperCase().replace(/\s/g, ""))}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => form.setValue("code", randomVoucherCode(), { shouldValidate: form.formState.isSubmitted })}
                      >
                        <ShuffleIcon className="size-4" />
                        Acak
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </NameStatusFields>
          </FormSection>

          <FormSection icon={PercentIcon} title="Nilai Diskon" description="Potongan dari total belanja satu transaksi">
            <DiscountValueFields maxHint="Per transaksi. Kosongkan jika tanpa batas">
              <FormField
                control={form.control}
                name="minimumPurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Belanja</FormLabel>
                    <FormControl>
                      <AffixInput
                        name={field.name}
                        inputRef={field.ref}
                        onBlur={field.onBlur}
                        value={field.value}
                        onChange={field.onChange}
                        prefix="Rp"
                        grouped
                        maxLength={12}
                        placeholder="Tanpa minimum"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Dihitung dari total setelah diskon otomatis. Kosongkan jika tanpa minimum
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DiscountValueFields>
          </FormSection>

          <FormSection icon={CalendarRangeIcon} title="Periode Berlaku" description="Kapan kode voucher bisa dipakai">
            <PeriodFields />
          </FormSection>

          <SummaryBanner lines={summaryLines} />
        </div>

        <DrawerFooter
          submitLabel="Simpan Voucher"
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </form>
    </Form>
  )
}
