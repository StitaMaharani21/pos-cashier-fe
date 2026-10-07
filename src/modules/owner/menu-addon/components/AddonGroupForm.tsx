import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ListChecksIcon, ListPlusIcon, PlusIcon, SlidersHorizontalIcon, Trash2Icon, UtensilsIcon } from "lucide-react"
import { useFieldArray } from "react-hook-form"

import type { AddonGroup } from "@/entities/menu-addon/model/menu-addon.types"
import { AffixInput } from "@/modules/owner/discount-form/components/AffixInput"
import { DrawerFooter } from "@/modules/owner/discount-form/components/DrawerFooter"
import {
  ADDON_MENU_PICKER_KEY,
  listAllMenus,
  type AddonGroupDraft,
} from "@/modules/owner/menu-addon/api/menu-addon.service"
import {
  GROUP_NAME_MAX,
  OPTION_NAME_MAX,
  PRICE_MAX_LENGTH,
  menuAddonSchema,
  type MenuAddonFormValues,
} from "@/modules/owner/menu-addon/schemas/menu-addon.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { FormSection, RequiredMark } from "@/shared/ui/form-section"
import { Input } from "@/shared/ui/input"
import { Switch } from "@/shared/ui/switch"

interface AddonGroupFormProps {
  row: AddonGroup | null
  isSubmitting: boolean
  onSubmit: (draft: AddonGroupDraft) => void
  onCancel: () => void
  onDelete?: () => void
  isDeleting: boolean
}

const EMPTY_OPTION = { optionId: undefined, name: "", price: "", isActive: true }

// The "Tambah Grup Addon" drawer: a named set of choices (e.g. "Tambahan":
// Gula +Rp5.000), how many a customer may pick, and which menus offer it.
export function AddonGroupForm({ row, isSubmitting, onSubmit, onCancel, onDelete, isDeleting }: AddonGroupFormProps) {
  const form = useCrudForm<MenuAddonFormValues>({
    schema: menuAddonSchema,
    defaultValues: {
      name: row?.name ?? "",
      selection: row && row.max_select !== 1 ? "multiple" : "single",
      maxSelect: row && row.max_select > 1 ? String(row.max_select) : "",
      isRequired: row?.is_required ?? false,
      isActive: (row?.status ?? "active") === "active",
      options: row?.options?.length
        ? row.options.map((option) => ({
            optionId: option.id,
            name: option.name,
            price: option.price ? String(Math.round(option.price)) : "",
            isActive: option.status === "active",
          }))
        : [{ ...EMPTY_OPTION }],
      menuIds: row?.menu_ids ?? [],
    },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "options" })

  const selection = form.watch("selection")

  function handleSubmit(values: MenuAddonFormValues) {
    onSubmit({
      name: values.name.trim(),
      is_required: values.isRequired,
      max_select: values.selection === "single" ? 1 : Number(values.maxSelect) || 0,
      status: values.isActive ? "active" : "inactive",
      options: values.options.map((option) => ({
        id: option.optionId,
        name: option.name.trim(),
        price: Number(option.price) || 0,
        status: option.isActive ? "active" : "inactive",
      })),
      menu_ids: values.menuIds,
      original: row ?? undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <FormSection
            icon={ListPlusIcon}
            title="Informasi Grup"
            description="Nama yang dilihat customer saat memilih tambahan"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Grup
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Tambahan, Level Gula"
                      maxLength={GROUP_NAME_MAX}
                      autoFocus
                      className="h-11 bg-card"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-xl border bg-card px-4 py-3">
                  <div className="flex-1">
                    <FormLabel className="text-sm font-semibold">{field.value ? "Aktif" : "Nonaktif"}</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Grup nonaktif tidak muncul saat customer atau kasir memilih menu
                    </p>
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
          </FormSection>

          <FormSection
            icon={SlidersHorizontalIcon}
            title="Aturan Pilihan"
            description="Berapa opsi yang boleh dipilih dari grup ini"
          >
            <FormField
              control={form.control}
              name="selection"
              render={({ field }) => (
                <FormItem>
                  <div role="radiogroup" aria-label="Jumlah pilihan" className="grid grid-cols-2 gap-2">
                    {[
                      { value: "single", label: "Pilih satu", hint: "Mis. level gula" },
                      { value: "multiple", label: "Boleh lebih dari satu", hint: "Mis. topping" },
                    ].map((option) => {
                      const selected = field.value === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            "flex flex-col items-start gap-0.5 rounded-xl border bg-card px-4 py-3 text-left transition-colors",
                            selected ? "border-primary ring-2 ring-primary/30" : "hover:bg-muted"
                          )}
                        >
                          <span className="text-sm font-semibold text-foreground">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.hint}</span>
                        </button>
                      )
                    })}
                  </div>
                </FormItem>
              )}
            />

            {selection === "multiple" && (
              <FormField
                control={form.control}
                name="maxSelect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maksimal Pilihan</FormLabel>
                    <FormControl>
                      <AffixInput
                        name={field.name}
                        inputRef={field.ref}
                        onBlur={field.onBlur}
                        value={field.value}
                        onChange={field.onChange}
                        suffix="opsi"
                        maxLength={2}
                        placeholder="Tanpa batas"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Kosongkan jika customer boleh memilih semuanya</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 rounded-xl border bg-card px-4 py-3">
                  <div className="flex-1">
                    <FormLabel className="text-sm font-semibold">Wajib dipilih</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Customer harus memilih minimal satu opsi sebelum menambah menu ke pesanan
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </FormSection>

          <FormSection
            icon={ListChecksIcon}
            title="Opsi & Harga Tambahan"
            description="Biaya ditambahkan ke harga menu saat opsi dipilih"
            aside={
              <Button type="button" variant="outline" size="sm" onClick={() => append({ ...EMPTY_OPTION })}>
                <PlusIcon className="size-4" />
                Tambah Opsi
              </Button>
            }
          >
            <div className="flex flex-col gap-3">
              {fields.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2 rounded-xl border bg-card p-3">
                  <FormField
                    control={form.control}
                    name={`options.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="min-w-0 flex-1">
                        <FormLabel className="sr-only">Nama opsi {index + 1}</FormLabel>
                        <FormControl>
                          <Input placeholder="Mis. Gula" maxLength={OPTION_NAME_MAX} className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`options.${index}.price`}
                    render={({ field }) => (
                      <FormItem className="w-40 shrink-0">
                        <FormLabel className="sr-only">Harga tambahan opsi {index + 1}</FormLabel>
                        <FormControl>
                          <AffixInput
                            name={field.name}
                            inputRef={field.ref}
                            onBlur={field.onBlur}
                            value={field.value}
                            onChange={field.onChange}
                            prefix="+ Rp"
                            grouped
                            maxLength={PRICE_MAX_LENGTH}
                            placeholder="Gratis"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`options.${index}.isActive`}
                    render={({ field }) => (
                      <FormItem className="flex h-11 shrink-0 items-center">
                        <FormLabel className="sr-only">Opsi {index + 1} aktif</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            title={field.value ? "Aktif" : "Nonaktif"}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Hapus opsi ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.options?.root?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.options.root.message}</p>
              )}
              {form.formState.errors.options?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.options.message}</p>
              )}
            </div>
          </FormSection>

          <FormSection
            icon={UtensilsIcon}
            title="Berlaku untuk Menu"
            description="Menu yang menawarkan grup ini kepada customer"
          >
            <FormField
              control={form.control}
              name="menuIds"
              render={({ field }) => <MenuPicker value={field.value} onChange={field.onChange} />}
            />
          </FormSection>
        </div>

        <DrawerFooter
          submitLabel="Simpan Grup"
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      </form>
    </Form>
  )
}

function MenuPicker({ value, onChange }: { value: number[]; onChange: (ids: number[]) => void }) {
  const [search, setSearch] = useState("")
  const { data: menus = [], isLoading, isError } = useQuery({
    queryKey: ADDON_MENU_PICKER_KEY,
    queryFn: listAllMenus,
    staleTime: 60_000,
  })

  const selected = useMemo(() => new Set(value), [value])
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return term
      ? menus.filter((menu) => `${menu.name ?? ""} ${menu.category_name ?? ""}`.toLowerCase().includes(term))
      : menus
  }, [menus, search])
  const allVisibleSelected = visible.length > 0 && visible.every((menu) => selected.has(menu.id ?? 0))

  function toggle(id: number, checked: boolean) {
    onChange(checked ? [...value, id] : value.filter((existing) => existing !== id))
  }

  function toggleAllVisible() {
    const visibleIds = visible.map((menu) => menu.id ?? 0)
    onChange(
      allVisibleSelected
        ? value.filter((id) => !visibleIds.includes(id))
        : [...value, ...visibleIds.filter((id) => !selected.has(id))]
    )
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat daftar menu...</p>
  if (isError) return <p className="text-sm text-destructive">Gagal memuat daftar menu. Tutup lalu buka lagi formulir ini.</p>
  if (menus.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada menu. Tambahkan menu dulu, lalu hubungkan di sini.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari menu atau kategori..."
          className="h-10 bg-card"
        />
        <Button type="button" variant="outline" className="h-10 shrink-0" onClick={toggleAllVisible}>
          {allVisibleSelected ? "Batal semua" : "Pilih semua"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{value.length} dari {menus.length} menu dipilih</p>
      <div className="flex max-h-64 flex-col overflow-y-auto rounded-xl border bg-card">
        {visible.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">Tidak ada menu yang cocok.</p>}
        {visible.map((menu) => {
          const id = menu.id ?? 0
          return (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 border-b px-4 py-2.5 last:border-b-0 hover:bg-muted/60"
            >
              <Checkbox checked={selected.has(id)} onCheckedChange={(checked) => toggle(id, checked === true)} />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{menu.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{menu.category_name}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
