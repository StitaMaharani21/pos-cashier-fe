import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { CopyIcon } from "lucide-react"
import { toast } from "sonner"

import type { Recipe } from "@/entities/recipe/model/recipe.types"
import { listMenus } from "@/modules/owner/menu/api/menu.service"
import { MENUS_KEY } from "@/modules/owner/menu/constants/menu-display"
import {
  ADDON_GROUPS_KEY,
  ADDON_LIST_PARAMS,
  menuAddonService,
} from "@/modules/owner/menu-addon/api/menu-addon.service"
import { listAllIngredients, listMenuRecipes, recipeService } from "@/modules/owner/recipe/api/recipe.service"
import { RecipeSection } from "@/modules/owner/recipe/components/RecipeSection"
import { recipeLineText } from "@/modules/owner/recipe/lib/recipe-format"
import { Button } from "@/shared/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

interface RecipeManagerProps {
  menuId: number
}

interface ServingOption {
  id: number
  label: string
  groupId: number
  groupName: string
}

// "Resep / Bahan Baku" of one menu. Lines either apply to every serving
// ("Semua penyajian") or only when an addon option such as Ice is ordered, so
// a Hot cup never consumes ice cubes. The serving options come from the addon
// groups already attached to the menu on the server.
export function RecipeManager({ menuId }: RecipeManagerProps) {
  const queryClient = useQueryClient()
  const recipesQueryKey = ["recipes", menuId]
  const recipesQuery = useQuery({
    queryKey: recipesQueryKey,
    queryFn: () => listMenuRecipes(menuId),
    retry: false,
  })
  const ingredientsQuery = useQuery({
    queryKey: ["ingredients", "all"],
    queryFn: listAllIngredients,
    retry: false,
  })
  const groupsQuery = useQuery({
    queryKey: [ADDON_GROUPS_KEY, ADDON_LIST_PARAMS],
    queryFn: () => menuAddonService.list(ADDON_LIST_PARAMS),
    staleTime: 30_000,
  })
  // Other menus that already have a recipe, to copy one from.
  const sourceMenusQuery = useQuery({
    queryKey: [...MENUS_KEY, "recipe-sources"],
    queryFn: () => listMenus({ page: 1, perPage: 100, stockDeductionMethod: "by_ingredient" }),
    staleTime: 30_000,
  })

  // Serving options the owner opened a section for before adding any line.
  const [openedOptionIds, setOpenedOptionIds] = useState<number[]>([])
  const [copying, setCopying] = useState(false)

  const recipes = useMemo(() => recipesQuery.data ?? [], [recipesQuery.data])
  const ingredients = ingredientsQuery.data ?? []

  const servingOptions = useMemo<ServingOption[]>(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => group.status !== "inactive" && (group.menu_ids ?? []).includes(menuId))
        .flatMap((group) =>
          group.options
            .filter((option) => option.status !== "inactive")
            .map((option) => ({ id: option.id, label: option.name, groupId: group.id, groupName: group.name }))
        ),
    [groupsQuery.data, menuId]
  )

  const baseRows = recipes.filter((row) => row.addon_option_id == null)
  const rowsByOption = new Map<number, Recipe[]>()
  for (const row of recipes) {
    if (row.addon_option_id == null) continue
    rowsByOption.set(row.addon_option_id, [...(rowsByOption.get(row.addon_option_id) ?? []), row])
  }

  const knownOptionIds = new Set(servingOptions.map((option) => option.id))
  const shownOptions = servingOptions.filter((option) => rowsByOption.has(option.id) || openedOptionIds.includes(option.id))
  const hiddenOptions = servingOptions.filter((option) => !shownOptions.includes(option))
  // Lines tied to an option that is no longer attached to the menu (or was
  // switched off): kept visible so they can be removed, but they never apply.
  const orphanOptionIds = [...rowsByOption.keys()].filter((id) => !knownOptionIds.has(id))

  // "What gets deducted for one portion", per serving: the shared lines plus the
  // lines of that serving. Shown for every option of a group that has any
  // serving-specific line (so Hot is listed next to Ice), otherwise as one line.
  const summary = useMemo(() => {
    const groupsWithLines = new Set(servingOptions.filter((option) => rowsByOption.has(option.id)).map((option) => option.groupId))
    const describe = (lines: Recipe[]) => (lines.length > 0 ? lines.map(recipeLineText).join(" + ") : "belum ada bahan")
    if (groupsWithLines.size === 0) {
      return baseRows.length > 0 ? [{ label: "Setiap pesanan", text: describe(baseRows) }] : []
    }
    return servingOptions
      .filter((option) => groupsWithLines.has(option.groupId))
      .map((option) => ({ label: option.label, text: describe([...baseRows, ...(rowsByOption.get(option.id) ?? [])]) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servingOptions, recipes])

  const sourceMenus = (sourceMenusQuery.data?.items ?? []).filter((menu) => menu.id !== menuId)

  // Copies another menu's recipe into this (still empty) one. Lines tied to a
  // serving option this menu does not have are skipped, since they could never apply.
  async function copyFrom(sourceId: number) {
    setCopying(true)
    try {
      const source = await listMenuRecipes(sourceId)
      const usable = source.filter((row) => row.addon_option_id == null || knownOptionIds.has(row.addon_option_id))
      let copied = 0
      let failed = 0
      for (const row of usable) {
        try {
          await recipeService.create({
            menu_id: menuId,
            ingredient_id: row.ingredient_id ?? 0,
            quantity: row.quantity ?? 0,
            addon_option_id: row.addon_option_id ?? null,
          })
          copied += 1
        } catch {
          failed += 1
        }
      }
      const skipped = source.length - usable.length
      if (copied > 0) toast.success(`${copied} bahan disalin ke resep`)
      if (failed > 0 || skipped > 0) {
        toast.warning(
          [
            failed > 0 ? `${failed} bahan gagal disalin (mungkin sudah nonaktif)` : "",
            skipped > 0 ? `${skipped} bahan khusus penyajian dilewati karena menu ini tidak punya penyajian itu` : "",
          ]
            .filter(Boolean)
            .join(". ")
        )
      }
      if (copied === 0 && failed === 0 && skipped === 0) toast.info("Menu itu belum punya resep")
      await queryClient.invalidateQueries({ queryKey: recipesQueryKey })
    } catch {
      toast.error("Resep belum bisa disalin. Coba lagi.")
    } finally {
      setCopying(false)
    }
  }

  if (recipesQuery.isError || ingredientsQuery.isError) {
    const locked = [recipesQuery.error, ingredientsQuery.error].some(
      (error) => isAxiosError(error) && error.response?.status === 402
    )
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3">
        <h3 className="text-sm font-semibold text-foreground">Resep / Bahan Baku</h3>
        <p className="text-sm text-muted-foreground">
          {locked
            ? "Resep bahan baku belum aktif di paket toko ini. Aktifkan paket Pro atau addon Inventori untuk memakainya."
            : "Resep belum bisa dimuat. Periksa koneksi, lalu coba lagi."}
        </p>
        {!locked && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => {
              void recipesQuery.refetch()
              void ingredientsQuery.refetch()
            }}
          >
            Coba lagi
          </Button>
        )}
      </div>
    )
  }

  if (recipesQuery.isLoading || ingredientsQuery.isLoading) {
    return <p className="py-2 text-sm text-muted-foreground">Memuat resep...</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Resep / Bahan Baku</h3>
        <p className="text-xs text-muted-foreground">
          Bahan yang terpakai setiap 1 porsi menu ini terjual. Contoh Cafe Latte: biji kopi 18 gram dan susu 150 ml.
        </p>
        <p className="text-xs text-muted-foreground">
          Caranya: pilih bahan, isi jumlah, lalu tekan Tambah. Satuan boleh gram atau kg (ml atau liter); otomatis
          disesuaikan dengan satuan stok bahan.
        </p>
      </div>

      {recipes.length === 0 && sourceMenus.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-dashed bg-card p-3">
          <p className="text-xs text-muted-foreground">Resepnya mirip menu lain? Salin dulu, lalu ubah seperlunya.</p>
          <Select value="" onValueChange={(value) => void copyFrom(Number(value))} disabled={copying}>
            <SelectTrigger className="w-full">
              <CopyIcon className="size-4 text-muted-foreground" />
              <SelectValue placeholder={copying ? "Menyalin resep..." : "Salin resep dari menu lain"} />
            </SelectTrigger>
            <SelectContent>
              {sourceMenus.map((menu) => (
                <SelectItem key={menu.id} value={String(menu.id)}>
                  {menu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {summary.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary-strong">Yang terpotong dari stok per 1 porsi</p>
          <ul className="flex flex-col gap-1 text-sm text-foreground">
            {summary.map((entry) => (
              <li key={entry.label}>
                <span className="font-semibold">{entry.label}:</span> {entry.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      <RecipeSection
        menuId={menuId}
        optionId={null}
        title="Semua penyajian"
        description="Bahan yang selalu terpakai, apa pun penyajian yang dipilih pelanggan."
        emptyHint="Belum ada bahan. Mulai dari bahan utama, mis. biji kopi."
        rows={baseRows}
        ingredients={ingredients}
        recipesQueryKey={recipesQueryKey}
      />

      {shownOptions.map((option) => (
        <RecipeSection
          key={option.id}
          menuId={menuId}
          optionId={option.id}
          title={`Khusus ${option.label}`}
          description={`Bahan tambahan yang hanya terpakai bila pelanggan memilih ${option.label} (${option.groupName}); ditambahkan di atas bahan "Semua penyajian".`}
          emptyHint={`Belum ada bahan khusus ${option.label}. Isi hanya bahan tambahannya (mis. es batu); bahan yang sama untuk semua penyajian cukup di "Semua penyajian".`}
          rows={rowsByOption.get(option.id) ?? []}
          ingredients={ingredients}
          recipesQueryKey={recipesQueryKey}
          // A block opened by mistake (no lines yet) can be closed again.
          onClose={() => setOpenedOptionIds((current) => current.filter((id) => id !== option.id))}
        />
      ))}

      {orphanOptionIds.map((optionId) => {
        const rows = rowsByOption.get(optionId) ?? []
        return (
          <RecipeSection
            key={`orphan-${optionId}`}
            menuId={menuId}
            optionId={optionId}
            title={`Khusus ${rows[0]?.addon_option_name || `opsi #${optionId}`} (tidak aktif)`}
            description="Opsi ini tidak lagi terpasang atau aktif di menu, jadi bahan di bawah ini tidak dipakai. Hapus bila tidak perlu."
            emptyHint="Tidak ada bahan."
            rows={rows}
            ingredients={ingredients}
            recipesQueryKey={recipesQueryKey}
          />
        )
      })}

      {hiddenOptions.length > 0 ? (
        <Select
          value=""
          onValueChange={(value) => setOpenedOptionIds((current) => [...current, Number(value)])}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="+ Tambah bahan khusus penyajian (mis. es batu untuk Ice)" />
          </SelectTrigger>
          <SelectContent>
            {hiddenOptions.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label} ({option.groupName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        servingOptions.length === 0 && (
          <p className="rounded-lg border border-dashed bg-card p-3 text-xs text-muted-foreground">
            Menu ini punya penyajian berbeda (mis. Hot dan Ice)? Pasang grup tambahan "Penyajian" di bagian Tambahan
            Menu dan simpan menu; setelah itu bahan khusus tiap penyajian bisa diatur di sini.
          </p>
        )
      )}
    </div>
  )
}
