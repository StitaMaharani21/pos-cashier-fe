import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { Recipe } from "@/entities/recipe/model/recipe.types"
import { recipeService } from "@/modules/owner/recipe/api/recipe.service"
import {
  convertUnit,
  getSmallestUnit,
  getUnitOptions,
  roundUnitValue,
} from "@/modules/owner/recipe/lib/unit-conversion"
import { recipeRowSchema, type RecipeRowFormValues } from "@/modules/owner/recipe/schemas/recipe.schema"
import { apiClient } from "@/shared/api/client"
import { CrudServiceError, type PaginatedResponse } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface RecipeManagerProps {
  menuId: number
}

// Self-contained fetch, mirroring MenuSection.tsx's own listAllCategories()
// helper, rather than importing modules/owner/ingredient's paginated
// service — keeps this component independent of that module.
async function listAllIngredients(): Promise<Ingredient[]> {
  try {
    const response = await apiClient.get<PaginatedResponse<Ingredient>>("/master/ingredients", {
      params: { page: 1, per_page: 100 },
    })
    return response.data.data
  } catch (error) {
    console.error("Failed to list ingredients for recipe picker", error)
    return []
  }
}

export function RecipeManager({ menuId }: RecipeManagerProps) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState("")
  const [editingUnit, setEditingUnit] = useState("")

  const recipesQueryKey = ["recipes", menuId]
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: recipesQueryKey,
    queryFn: () => recipeService.list({ menu_id: menuId, page: 1, per_page: 100 }),
  })

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients", "all"],
    queryFn: listAllIngredients,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: recipesQueryKey })

  const createMutation = useMutation({
    mutationFn: recipeService.create,
    onSuccess: () => {
      toast.success("Bahan baku ditambahkan ke resep")
      form.reset({ ingredientId: "", quantity: "", unit: "" })
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      recipeService.update(id, { quantity }),
    onSuccess: () => {
      toast.success("Jumlah resep diperbarui")
      setEditingId(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => recipeService.remove(id),
    onSuccess: () => {
      toast.success("Bahan baku dihapus dari resep")
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const form = useCrudForm({
    schema: recipeRowSchema,
    defaultValues: { ingredientId: "", quantity: "", unit: "" },
  })

  const usedIngredientIds = new Set(recipes.map((row) => row.ingredient_id))
  const availableIngredients = ingredients.filter((ingredient) => !usedIngredientIds.has(ingredient.id))

  const selectedIngredientId = form.watch("ingredientId")
  const selectedIngredient = availableIngredients.find(
    (ingredient) => String(ingredient.id) === selectedIngredientId
  )
  const entryUnitOptions = getUnitOptions(selectedIngredient?.unit)

  // Default the entry unit to the smallest/friendliest unit in the chosen
  // ingredient's group (e.g. picking "Biji Kopi" tracked in "kg" defaults
  // the entry unit to "gram") whenever the selected ingredient changes.
  useEffect(() => {
    if (selectedIngredient) {
      form.setValue("unit", getSmallestUnit(selectedIngredient.unit))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIngredientId])

  function handleAdd(values: RecipeRowFormValues) {
    if (!selectedIngredient) return
    const quantityInIngredientUnit = convertUnit(
      Number(values.quantity),
      values.unit,
      selectedIngredient.unit ?? values.unit
    )
    createMutation.mutate({
      menu_id: menuId,
      ingredient_id: Number(values.ingredientId),
      quantity: quantityInIngredientUnit,
    })
  }

  function startEdit(row: Recipe) {
    const rawUnit = row.ingredient_unit ?? ""
    const entryUnit = getSmallestUnit(rawUnit) || rawUnit
    setEditingId(row.id ?? null)
    setEditingUnit(entryUnit)
    setEditingQuantity(String(roundUnitValue(convertUnit(row.quantity ?? 0, rawUnit, entryUnit))))
  }

  function handleEditingUnitChange(newUnit: string) {
    const numeric = Number(editingQuantity)
    if (!Number.isNaN(numeric) && editingUnit) {
      setEditingQuantity(String(roundUnitValue(convertUnit(numeric, editingUnit, newUnit))))
    }
    setEditingUnit(newUnit)
  }

  function saveEdit(row: Recipe) {
    const quantity = Number(editingQuantity)
    if (!editingQuantity || Number.isNaN(quantity) || quantity <= 0) {
      toast.error("Jumlah harus lebih dari 0")
      return
    }
    const quantityInIngredientUnit = convertUnit(quantity, editingUnit, row.ingredient_unit ?? editingUnit)
    updateMutation.mutate({ id: row.id ?? 0, quantity: quantityInIngredientUnit })
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Resep / Bahan Baku</h3>
        <p className="text-xs text-muted-foreground">
          Jumlah bahan yang terpakai setiap 1 unit menu ini terjual — mis. Cafe Latte butuh 18g biji
          kopi dan 150ml susu per gelas. Masukkan dalam satuan yang paling nyaman (mis. gram) — otomatis
          dikonversi ke satuan stok bahan baku saat disimpan (didukung: gram↔kg, ml↔liter).
        </p>
      </div>

      {isLoading ? (
        <p className="py-2 text-sm text-muted-foreground">Memuat...</p>
      ) : recipes.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Belum ada bahan baku pada resep ini.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {recipes.map((row) => {
            const rawUnit = row.ingredient_unit ?? ""
            const displayUnit = getSmallestUnit(rawUnit) || rawUnit
            const displayQty = roundUnitValue(convertUnit(row.quantity ?? 0, rawUnit, displayUnit))
            const showRaw = displayUnit !== rawUnit

            return (
              <div
                key={row.id}
                className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <span className="text-sm font-medium text-foreground">{row.ingredient_name}</span>

                {editingId === row.id ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={editingQuantity}
                      onChange={(event) => setEditingQuantity(event.target.value)}
                      className="h-8 w-20"
                      autoFocus
                    />
                    <Select value={editingUnit} onValueChange={handleEditingUnitChange}>
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnitOptions(rawUnit).map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => saveEdit(row)}
                      disabled={updateMutation.isPending}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <CheckIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">
                      {displayQty} {displayUnit}
                      {showRaw && (
                        <span className="ml-1 text-xs text-muted-foreground/70">
                          ({row.quantity} {rawUnit})
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(row.id ?? 0)}
                      disabled={removeMutation.isPending}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAdd)} className="flex flex-col gap-2 border-t pt-3">
          <FormField
            control={form.control}
            name="ingredientId"
            render={({ field }) => (
              <FormItem>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan baku" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIngredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                        {ingredient.name} (stok: {ingredient.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-end gap-2">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="number" min={0} step="any" placeholder="Jumlah per sajian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="w-28">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Satuan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entryUnitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createMutation.isPending || !selectedIngredient} size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return "Terjadi kesalahan"
}
