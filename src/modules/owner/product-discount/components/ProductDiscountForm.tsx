import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CalendarRangeIcon,
  ChevronDownIcon,
  ImageIcon,
  MinusIcon,
  PercentIcon,
  PlusIcon,
  TagIcon,
  UtensilsIcon,
  XIcon,
} from "lucide-react"

import type {
  CreateProductDiscountPayload,
  ProductDiscount,
} from "@/entities/product-discount/model/product-discount.types"
import { DiscountValueFields } from "@/modules/owner/discount-form/components/DiscountValueFields"
import { DrawerFooter } from "@/modules/owner/discount-form/components/DrawerFooter"
import { NameStatusFields } from "@/modules/owner/discount-form/components/NameStatusFields"
import { PeriodFields } from "@/modules/owner/discount-form/components/PeriodFields"
import { SummaryBanner } from "@/modules/owner/discount-form/components/SummaryBanner"
import {
  ALL_DAYS,
  DAY_OPTIONS,
  describeDays,
  describeHours,
  describePeriodInline,
  describeValue,
  fromApiDate,
  toApiDate,
  todayInput,
  type DiscountRule,
} from "@/modules/owner/discount-form/lib/discount-rules"
import { listMenuCategories } from "@/modules/owner/menu-category/api/menu-category.service"
import { MENU_CATEGORIES_KEY } from "@/modules/owner/menu-category/constants/query-keys"
import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { MENUS_KEY } from "@/modules/owner/menu/constants/menu-display"
import { MenuPickerDialog } from "@/modules/owner/product-discount/components/MenuPickerDialog"
import {
  productDiscountSchema,
  type ProductDiscountFormValues,
} from "@/modules/owner/product-discount/schemas/product-discount.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { FormSection, RequiredMark } from "@/shared/ui/form-section"
import { Switch } from "@/shared/ui/switch"

interface ProductDiscountFormProps {
  row: ProductDiscount | null
  isSubmitting: boolean
  onSubmit: (payload: CreateProductDiscountPayload) => void
  onCancel: () => void
  onDelete?: () => void
  isDeleting: boolean
}

// Chips shown before collapsing the rest into "+N lainnya".
const CHIP_LIMIT = 8

interface MenuChip {
  id: number
  name: string
  imageUrl?: string
}

// The "Tambah Diskon Otomatis" drawer: Informasi Diskon, Nilai Diskon,
// Periode Berlaku (+ Atur hari & jam), Menu yang Kena Diskon (picked in
// MenuPickerDialog), a summary, then Batal / Simpan Diskon.
export function ProductDiscountForm({
  row,
  isSubmitting,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting,
}: ProductDiscountFormProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const hasSchedule = (row?.active_days?.length ?? 0) > 0 || !!row?.start_time
  const [scheduleOpen, setScheduleOpen] = useState(hasSchedule)

  // Every menu in one page — the picker filters client-side.
  const { data: menuPage } = useQuery({
    queryKey: [...MENUS_KEY, "discount-picker"],
    queryFn: () => listMenus({ page: 1, perPage: 500 }),
  })
  const menus = menuPage?.items ?? []
  const { data: categories = [] } = useQuery({ queryKey: MENU_CATEGORIES_KEY, queryFn: listMenuCategories })

  const form = useCrudForm({
    schema: productDiscountSchema,
    defaultValues: {
      name: row?.name ?? "",
      isActive: (row?.status ?? "active") === "active",
      type: (row?.type as "percent" | "fixed") ?? "percent",
      value: row?.value != null ? String(row.value) : "",
      maxDiscount: row?.max_discount ? String(Math.round(row.max_discount)) : "",
      minimumQty: Math.max(1, row?.minimum_qty ?? 1),
      startDate: row ? fromApiDate(row.start_date) : todayInput(),
      endDate: row ? fromApiDate(row.end_date) : todayInput(29),
      activeDays: row?.active_days?.length ? row.active_days : ALL_DAYS,
      allDay: !row?.start_time,
      startTime: row?.start_time ?? "",
      endTime: row?.end_time ?? "",
      menuIds: row?.menus?.map((menu) => menu.menu_id ?? 0) ?? [],
    },
  })

  const values = form.watch()
  const rule: DiscountRule = {
    type: values.type,
    value: Number(values.value) || 0,
    maxDiscount: values.type === "percent" ? Number(values.maxDiscount) || 0 : 0,
  }

  // Chip data: the live menu list, falling back to what the discount
  // itself returned while that list loads.
  const menuById = new Map<number, MenuChip>()
  for (const menu of row?.menus ?? []) {
    menuById.set(menu.menu_id ?? 0, { id: menu.menu_id ?? 0, name: menu.menu_name ?? "", imageUrl: menu.image_url })
  }
  for (const menu of menus) {
    menuById.set(menu.id ?? 0, { id: menu.id ?? 0, name: menu.name ?? "", imageUrl: menu.image_url })
  }
  const chips = values.menuIds.map((id) => menuById.get(id) ?? { id, name: `Menu #${id}` })

  function setMenuIds(ids: number[]) {
    form.setValue("menuIds", ids, { shouldValidate: form.formState.isSubmitted })
  }

  function handleSubmit(submitted: ProductDiscountFormValues) {
    const everyDay = submitted.activeDays.length === ALL_DAYS.length
    onSubmit({
      name: submitted.name.trim(),
      type: submitted.type,
      value: Number(submitted.value),
      max_discount: submitted.type === "percent" && submitted.maxDiscount ? Number(submitted.maxDiscount) : 0,
      minimum_qty: submitted.minimumQty > 1 ? submitted.minimumQty : 0,
      start_date: toApiDate(submitted.startDate),
      // Omitted = never expires.
      end_date: submitted.endDate ? toApiDate(submitted.endDate) : undefined,
      active_days: everyDay ? [] : ALL_DAYS.filter((day) => submitted.activeDays.includes(day)),
      start_time: submitted.allDay ? "" : submitted.startTime,
      end_time: submitted.allDay ? "" : submitted.endTime,
      status: submitted.isActive ? "active" : "inactive",
      menu_ids: submitted.menuIds,
    })
  }

  const scheduleSummary = `${describeDays(values.activeDays)} · ${
    values.allDay ? "Sepanjang hari" : describeHours(values.startTime, values.endTime)
  }`
  const summaryLines = [
    `Potongan ${describeValue(rule)} untuk ${values.menuIds.length} menu${
      values.minimumQty > 1 ? `, min. beli ${values.minimumQty} item per menu` : ""
    }.`,
    `Berlaku ${describePeriodInline(values.startDate, values.endDate)} · ${scheduleSummary}.`,
    values.isActive
      ? "Langsung dipakai kasir otomatis — tanpa kode."
      : "Disimpan nonaktif — belum dipakai di kasir.",
  ]

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          // Don't leave a schedule error hidden in the collapsed panel.
          if (errors.activeDays || errors.startTime || errors.endTime) setScheduleOpen(true)
        })}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <FormSection icon={TagIcon} title="Informasi Diskon" description="Nama yang tampil di struk dan layar kasir">
            <NameStatusFields
              nameLabel="Nama Diskon"
              namePlaceholder="Contoh: Happy Hour Kopi"
              statusHint="Nonaktifkan untuk menghentikan diskon tanpa menghapusnya"
            />
          </FormSection>

          <FormSection icon={PercentIcon} title="Nilai Diskon" description="Besar potongan untuk setiap menu terpilih">
            <DiscountValueFields maxHint="Per item. Kosongkan jika tanpa batas">
              <FormField
                control={form.control}
                name="minimumQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimal Pembelian</FormLabel>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 items-center overflow-hidden rounded-md border border-input bg-card">
                        <button
                          type="button"
                          aria-label="Kurangi"
                          disabled={field.value <= 1}
                          onClick={() => field.onChange(Math.max(1, form.getValues("minimumQty") - 1))}
                          className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40"
                        >
                          <MinusIcon className="size-4" />
                        </button>
                        <FormControl>
                          <input
                            inputMode="numeric"
                            className="h-full w-14 border-x bg-transparent text-center text-sm font-semibold outline-none"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value}
                            onChange={(event) =>
                              field.onChange(Math.min(999, Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1)))
                            }
                          />
                        </FormControl>
                        <button
                          type="button"
                          aria-label="Tambah"
                          onClick={() => field.onChange(Math.min(999, form.getValues("minimumQty") + 1))}
                          className="flex h-full w-11 items-center justify-center text-muted-foreground hover:bg-muted"
                        >
                          <PlusIcon className="size-4" />
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground">item</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {field.value > 1
                        ? `Diskon berlaku jika membeli minimal ${field.value} porsi menu yang sama dalam satu transaksi`
                        : "Berlaku mulai pembelian 1 item"}
                    </p>
                  </FormItem>
                )}
              />
            </DiscountValueFields>
          </FormSection>

          <FormSection icon={CalendarRangeIcon} title="Periode Berlaku" description="Kapan diskon otomatis aktif">
            <PeriodFields>
              <div className="overflow-hidden rounded-xl border bg-card">
                <button
                  type="button"
                  aria-expanded={scheduleOpen}
                  onClick={() => setScheduleOpen((open) => !open)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/40"
                >
                  <span className="text-sm font-semibold text-foreground">Atur hari & jam</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">{scheduleSummary}</span>
                  <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", scheduleOpen && "rotate-180")} />
                </button>

                {scheduleOpen && (
                  <div className="flex flex-col gap-4 border-t px-4 py-4">
                    <FormField
                      control={form.control}
                      name="activeDays"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Hari berlaku</FormLabel>
                            <button
                              type="button"
                              className="text-xs font-medium text-primary hover:underline"
                              onClick={() => field.onChange(field.value.length === ALL_DAYS.length ? [] : ALL_DAYS)}
                            >
                              {field.value.length === ALL_DAYS.length ? "Kosongkan" : "Pilih semua"}
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1.5">
                            {DAY_OPTIONS.map((day) => {
                              const on = field.value.includes(day.code)
                              return (
                                <button
                                  key={day.code}
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() => {
                                    // Current value, not the render's — two quick clicks must both land.
                                    const days = form.getValues("activeDays")
                                    field.onChange(
                                      days.includes(day.code) ? days.filter((code) => code !== day.code) : [...days, day.code]
                                    )
                                  }}
                                  className={cn(
                                    "rounded-lg border py-2 text-sm font-semibold transition-colors",
                                    on
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                  )}
                                >
                                  {day.label}
                                </button>
                              )
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-3">
                      <FormField
                        control={form.control}
                        name="allDay"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-3">
                            <div className="flex-1">
                              <FormLabel>Jam promo</FormLabel>
                              <p className="text-xs text-muted-foreground">
                                {field.value ? "Berlaku sepanjang jam buka" : "Hanya pada rentang jam tertentu"}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">Sepanjang hari</span>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {!values.allDay && (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            {(["startTime", "endTime"] as const).map((name) => (
                              <FormField
                                key={name}
                                control={form.control}
                                name={name}
                                render={({ field }) => (
                                  <FormItem>
                                    <span className="text-xs text-muted-foreground">{name === "startTime" ? "Dari" : "Sampai"}</span>
                                    <FormControl>
                                      <input
                                        type="time"
                                        className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                                        {...field}
                                      />
                                    </FormControl>
                                    {name === "endTime" && <FormMessage />}
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Jam selesai lebih awal dari jam mulai (mis. 22:00–02:00) berarti promo berlanjut lewat tengah malam.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </PeriodFields>
          </FormSection>

          <FormSection
            icon={UtensilsIcon}
            title="Menu yang Kena Diskon"
            description="Diskon otomatis terpasang saat menu ini masuk keranjang"
          >
            <FormField
              control={form.control}
              name="menuIds"
              render={() => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel>
                      {values.menuIds.length} menu dipilih
                      <RequiredMark />
                    </FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                      <PlusIcon className="size-4" />
                      Pilih Menu
                    </Button>
                  </div>

                  {chips.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="rounded-xl border border-dashed bg-card px-4 py-6 text-center text-sm text-muted-foreground hover:border-primary/40"
                    >
                      Belum ada menu. Klik untuk memilih menu yang kena diskon.
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {chips.slice(0, CHIP_LIMIT).map((chip) => (
                        <span key={chip.id} className="flex items-center gap-2 rounded-full border bg-card py-1 pr-1.5 pl-1 text-sm">
                          <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                            {chip.imageUrl ? (
                              <img src={chip.imageUrl} alt="" className="size-full object-cover" />
                            ) : (
                              <ImageIcon className="size-3 text-muted-foreground" />
                            )}
                          </span>
                          <span className="max-w-40 truncate font-medium">{chip.name}</span>
                          <button
                            type="button"
                            aria-label={`Hapus ${chip.name}`}
                            onClick={() => setMenuIds(values.menuIds.filter((id) => id !== chip.id))}
                            className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <XIcon className="size-3" />
                          </button>
                        </span>
                      ))}
                      {chips.length > CHIP_LIMIT && (
                        <button
                          type="button"
                          onClick={() => setPickerOpen(true)}
                          className="rounded-full border border-dashed bg-card px-3 py-1 text-sm font-medium text-primary hover:border-primary/40"
                        >
                          +{chips.length - CHIP_LIMIT} lainnya
                        </button>
                      )}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>

          <SummaryBanner lines={summaryLines} />
        </div>

        <DrawerFooter
          submitLabel="Simpan Diskon"
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </form>

      <MenuPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        menus={menus}
        categories={categories}
        selectedIds={values.menuIds}
        rule={rule}
        currentDiscountId={row?.id}
        onApply={setMenuIds}
      />
    </Form>
  )
}
