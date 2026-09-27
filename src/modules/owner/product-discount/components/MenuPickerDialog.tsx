import { useMemo, useState } from "react"
import { ImageIcon, SearchIcon, XIcon } from "lucide-react"

import type { MenuCategory } from "@/entities/menu-category/model/menu-category.types"
import type { Menu } from "@/entities/menu/model/menu.types"
import { discountAmount, type DiscountRule } from "@/modules/owner/discount-form/lib/discount-rules"
import { cn, formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog"

interface MenuPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menus: Menu[]
  categories: MenuCategory[]
  selectedIds: number[]
  // The draft rule, for the strike-through price preview.
  rule: DiscountRule
  // The discount being edited — its own badge isn't "another" discount.
  currentDiscountId?: number
  onApply: (ids: number[]) => void
}

type CategoryFilter = "all" | number

// Opened from "+ Pilih Menu": search, category chips, grouped checkbox
// list with the price after the draft discount. Selection is local until
// "Terapkan".
export function MenuPickerDialog(props: MenuPickerDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl" showCloseButton={false}>
        {/* Mounted only while open, so every open starts from the form's selection. */}
        {props.open && <PickerBody {...props} />}
      </DialogContent>
    </Dialog>
  )
}

function PickerBody({
  onOpenChange,
  menus,
  categories,
  selectedIds,
  rule,
  currentDiscountId,
  onApply,
}: MenuPickerDialogProps) {
  const [selected, setSelected] = useState(() => new Set(selectedIds))
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<CategoryFilter>("all")

  const query = search.trim().toLowerCase()

  // Category chips follow the category list's order (the owner's drag
  // order); counts reflect the search.
  const groups = useMemo(() => {
    const known = new Map(categories.map((c) => [c.id ?? 0, c.name ?? ""]))
    const byCategory = new Map<number, Menu[]>()
    for (const menu of menus) {
      const matches =
        !query || (menu.name ?? "").toLowerCase().includes(query) || (menu.code ?? "").toLowerCase().includes(query)
      if (!matches) continue
      const id = menu.category_id ?? 0
      byCategory.set(id, [...(byCategory.get(id) ?? []), menu])
    }
    const ordered = [
      ...categories.map((c) => c.id ?? 0),
      ...[...byCategory.keys()].filter((id) => !known.has(id)),
    ]
    return ordered
      .filter((id) => byCategory.has(id))
      .map((id) => {
        const items = byCategory.get(id) ?? []
        return { id, name: known.get(id) || items[0]?.category_name || "Tanpa kategori", items }
      })
  }, [menus, categories, query])

  const totalMatches = groups.reduce((sum, group) => sum + group.items.length, 0)
  const visibleGroups = category === "all" ? groups : groups.filter((group) => group.id === category)
  const visible = visibleGroups.flatMap((group) => group.items)
  const visibleSelected = visible.filter((menu) => selected.has(menu.id ?? 0)).length
  const allVisibleSelected = visible.length > 0 && visibleSelected === visible.length

  function toggle(id: number, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current)
      for (const menu of visible) {
        if (allVisibleSelected) next.delete(menu.id ?? 0)
        else next.add(menu.id ?? 0)
      }
      return next
    })
  }

  const selectAllLabel =
    category === "all"
      ? query
        ? "Pilih semua hasil pencarian"
        : "Pilih semua menu"
      : "Pilih semua di kategori ini"

  return (
    <>
      <DialogHeader className="flex-row items-start gap-3 border-b px-6 py-5 text-left">
        <div className="flex-1">
          <DialogTitle className="text-xl font-bold">Pilih Menu</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-primary">{selected.size} dipilih</span> · Menu yang otomatis kena diskon
          </DialogDescription>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="flex size-7 items-center justify-center rounded-md border opacity-80 hover:opacity-100"
          aria-label="Tutup"
        >
          <XIcon className="size-3.5" />
        </button>
      </DialogHeader>

      <div className="flex flex-col gap-3 border-b px-6 py-4">
        <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau kode menu..."
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </button>
          )}
        </div>

        <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
          {[{ id: "all" as const, name: "Semua", count: totalMatches }, ...groups.map((g) => ({ id: g.id, name: g.name, count: g.items.length }))].map(
            (chip) => (
              <button
                key={chip.id}
                type="button"
                aria-pressed={category === chip.id}
                onClick={() => setCategory(chip.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === chip.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {chip.name}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    category === chip.id ? "bg-primary-foreground/20" : "bg-muted"
                  )}
                >
                  {chip.count}
                </span>
              </button>
            )
          )}
        </div>

        {visible.length > 0 && (
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <Checkbox
              checked={allVisibleSelected ? true : visibleSelected > 0 ? "indeterminate" : false}
              onCheckedChange={toggleVisible}
            />
            {selectAllLabel}
            <span className="text-muted-foreground">
              ({visibleSelected}/{visible.length})
            </span>
          </label>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleGroups.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            {menus.length === 0 ? "Belum ada menu." : "Menu tidak ditemukan."}
          </p>
        )}
        {visibleGroups.map((group) => (
          <div key={group.id}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-muted/90 px-6 py-2 text-xs font-bold tracking-wide text-muted-foreground uppercase backdrop-blur">
              {group.name}
              <span className="font-medium normal-case">{group.items.length} menu</span>
            </div>
            <ul className="divide-y">
              {group.items.map((menu) => (
                <MenuRow
                  key={menu.id}
                  menu={menu}
                  categoryName={group.name}
                  checked={selected.has(menu.id ?? 0)}
                  onCheckedChange={(checked) => toggle(menu.id ?? 0, checked)}
                  rule={rule}
                  hasOtherDiscount={menu.discount?.id != null && menu.discount.id !== currentDiscountId}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t px-6 py-4">
        <Button type="button" variant="ghost" disabled={selected.size === 0} onClick={() => setSelected(new Set())}>
          Hapus pilihan
        </Button>
        <div className="ml-auto flex gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => {
              // Keep the menus' own order, not the click order.
              onApply(menus.map((menu) => menu.id ?? 0).filter((id) => selected.has(id)))
              onOpenChange(false)
            }}
          >
            Terapkan ({selected.size} menu)
          </Button>
        </div>
      </div>
    </>
  )
}

function MenuRow({
  menu,
  categoryName,
  checked,
  onCheckedChange,
  rule,
  hasOtherDiscount,
}: {
  menu: Menu
  categoryName: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  rule: DiscountRule
  hasOtherDiscount: boolean
}) {
  const price = menu.price ?? 0
  const cut = discountAmount(rule, price)

  return (
    <li>
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/50",
          checked && "bg-primary/5"
        )}
      >
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
          {menu.image_url ? (
            <img src={menu.image_url} alt="" className="size-full object-cover" loading="lazy" />
          ) : (
            <ImageIcon className="size-4 text-muted-foreground" />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">{menu.name}</span>
          <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {menu.code && <span className="font-mono">{menu.code}</span>}
            <span className="rounded-md bg-muted px-1.5 py-0.5">{categoryName}</span>
            {hasOtherDiscount && (
              <span
                className="rounded-md bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                title={`Sedang kena "${menu.discount?.name}". Jika beberapa diskon berlaku, kasir memakai potongan terbesar.`}
              >
                Ada diskon lain
              </span>
            )}
            {menu.is_available === false && <span className="italic">Tidak tersedia</span>}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end text-sm">
          {cut > 0 ? (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatRupiah(price)}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(price - cut)}</span>
            </>
          ) : (
            <span className="font-semibold text-foreground">{formatRupiah(price)}</span>
          )}
        </span>
      </label>
    </li>
  )
}
