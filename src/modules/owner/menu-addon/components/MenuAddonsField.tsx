import { useState } from "react"
import { ListPlusIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { describeSelection } from "@/modules/owner/menu-addon/columns/menu-addon.columns"
import { AddonGroupForm } from "@/modules/owner/menu-addon/components/AddonGroupForm"
import type { AddonGroupDraft } from "@/modules/owner/menu-addon/api/menu-addon.service"
import type { MenuAddonEntry, useMenuAddons } from "@/modules/owner/menu-addon/lib/use-menu-addons"
import { formatRupiah } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { FormSection } from "@/shared/ui/form-section"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"

export type MenuAddonsState = ReturnType<typeof useMenuAddons>

// What the group editor is open on: null entry = a brand-new group.
export interface AddonEditing {
  entry: MenuAddonEntry | null
}

interface MenuAddonsFieldProps {
  addons: MenuAddonsState
  onEdit: (editing: AddonEditing) => void
}

// "Tambahan Menu" card of the menu form: the groups this menu offers, with
// create / pick-existing / edit / detach. Lives inside the menu's <form>, so
// every button is type="button"; the editor sheet is rendered by the form,
// outside its <form> element (see MenuAddonEditorSheet).
export function MenuAddonsField({ addons, onEdit }: MenuAddonsFieldProps) {
  const [picking, setPicking] = useState(false)
  const { entries, available, isLoading, isError } = addons

  return (
    <FormSection
      icon={ListPlusIcon}
      title="Tambahan Menu"
      description="Pilihan berbayar yang bisa dipilih pelanggan, mis. Gula +Rp5.000"
    >
      {isLoading && <p className="text-sm text-muted-foreground">Memuat tambahan menu...</p>}

      {isError && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed bg-card p-3">
          <p className="text-sm text-destructive">Gagal memuat tambahan menu. Menu tetap bisa disimpan.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => addons.refetch()}>
            Coba Lagi
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {entries.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-card p-3 text-sm text-muted-foreground">
              Belum ada tambahan di menu ini.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <div key={entry.key} className="flex flex-col gap-2.5 rounded-xl border bg-card p-3.5">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                        {entry.group.name}
                        {entry.isNew && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary-strong">
                            Baru
                          </span>
                        )}
                        {entry.otherMenus > 0 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            Dipakai di {entry.otherMenus} menu lain
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{describeSelection(entry.group)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label={`Ubah ${entry.group.name}`}
                      onClick={() => onEdit({ entry })}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Lepas ${entry.group.name} dari menu ini`}
                      title="Lepas dari menu ini"
                      onClick={() => addons.remove(entry)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.group.options.map((option, index) => (
                      <span
                        key={`${option.id}-${index}`}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs whitespace-nowrap text-foreground"
                      >
                        {option.name}
                        {option.price > 0 && (
                          <span className="text-muted-foreground"> +{formatRupiah(option.price)}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onEdit({ entry: null })}>
              <PlusIcon className="size-4" />
              Buat Grup Baru
            </Button>
            {available.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={() => setPicking((value) => !value)}>
                {picking ? "Tutup Daftar" : "Pilih Grup yang Ada"}
              </Button>
            )}
          </div>

          {picking && available.length > 0 && (
            <div className="flex max-h-56 flex-col overflow-y-auto rounded-xl border bg-card">
              {available.map((group) => (
                <div key={group.id} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{group.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {group.options.map((option) => option.name).join(", ")}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addons.addExisting(group)}>
                    Tambahkan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </FormSection>
  )
}

interface MenuAddonEditorSheetProps {
  editing: AddonEditing | null
  onClose: () => void
  onSave: (draft: AddonGroupDraft) => void
}

// The group editor opened from the field above. A second drawer on top of the
// menu form; MenuForm renders it beside (not inside) its <form> so this
// form's submit doesn't bubble up to the menu form through the portal.
export function MenuAddonEditorSheet({ editing, onClose, onSave }: MenuAddonEditorSheetProps) {
  // Keep the last content while the drawer animates closed (editing is null
  // by then), so it doesn't flash empty.
  const [shown, setShown] = useState(editing)
  if (editing && editing !== shown) setShown(editing)
  const entry = shown?.entry ?? null
  return (
    <Sheet open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex max-w-xl flex-col p-0">
        <SheetHeader className="pr-14">
          <SheetTitle className="text-xl font-bold">{entry ? "Ubah Grup Tambahan" : "Grup Tambahan Baru"}</SheetTitle>
          <SheetDescription>
            Disimpan bersama menu saat Anda menekan Simpan Menu
          </SheetDescription>
        </SheetHeader>
        {shown && (
          <AddonGroupForm
            key={entry?.key ?? "new"}
            row={entry?.group ?? null}
            isSubmitting={false}
            isDeleting={false}
            showMenuPicker={false}
            submitLabel="Terapkan ke Menu"
            notice={
              entry && entry.otherMenus > 0
                ? `Grup ini juga dipakai di ${entry.otherMenus} menu lain. Perubahan berlaku untuk semuanya setelah menu disimpan.`
                : undefined
            }
            onSubmit={onSave}
            onCancel={onClose}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}
