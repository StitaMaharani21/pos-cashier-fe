import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import type { Recipe } from "@/entities/recipe/model/recipe.types"
import {
  ADDON_GROUPS_KEY,
  ADDON_LIST_PARAMS,
  menuAddonService,
} from "@/modules/owner/menu-addon/api/menu-addon.service"
import { listAllIngredients, listMenuRecipes } from "@/modules/owner/recipe/api/recipe.service"
import { RecipeSection } from "@/modules/owner/recipe/components/RecipeSection"
import { Button } from "@/shared/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

interface RecipeManagerProps {
  menuId: number
}

interface ServingOption {
  id: number
  label: string
  groupName: string
}

// "Resep / Bahan Baku" of one menu. Lines either apply to every serving
// ("Semua penyajian") or only when an addon option such as Ice is ordered, so
// a Hot cup never consumes ice cubes. The serving options come from the addon
// groups already attached to the menu on the server.
export function RecipeManager({ menuId }: RecipeManagerProps) {
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

  // Serving options the owner opened a section for before adding any line.
  const [openedOptionIds, setOpenedOptionIds] = useState<number[]>([])

  const recipes = useMemo(() => recipesQuery.data ?? [], [recipesQuery.data])
  const ingredients = ingredientsQuery.data ?? []

  const servingOptions = useMemo<ServingOption[]>(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => group.status !== "inactive" && (group.menu_ids ?? []).includes(menuId))
        .flatMap((group) =>
          group.options
            .filter((option) => option.status !== "inactive")
            .map((option) => ({ id: option.id, label: option.name, groupName: group.name }))
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
      <div>
        <h3 className="text-sm font-semibold text-foreground">Resep / Bahan Baku</h3>
        <p className="text-xs text-muted-foreground">
          Jumlah bahan yang terpakai setiap 1 unit menu ini terjual — mis. Cafe Latte butuh 18g biji kopi dan 150ml
          susu per gelas. Masukkan dalam satuan yang paling nyaman (mis. gram) — otomatis diubah ke satuan stok bahan
          baku saat disimpan (misalnya gram ke kg, ml ke liter).
        </p>
      </div>

      <RecipeSection
        menuId={menuId}
        optionId={null}
        title="Semua penyajian"
        description="Berlaku untuk setiap pesanan menu ini, apa pun penyajiannya."
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
          description={`Hanya terpakai bila pesanan memilih ${option.label} (${option.groupName}), di samping resep untuk semua penyajian.`}
          rows={rowsByOption.get(option.id) ?? []}
          ingredients={ingredients}
          recipesQueryKey={recipesQueryKey}
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
            <SelectValue placeholder="+ Tambah resep khusus penyajian (mis. Ice)" />
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
            Menu dan simpan menu; setelah itu resep khusus tiap penyajian bisa diatur di sini.
          </p>
        )
      )}
    </div>
  )
}
