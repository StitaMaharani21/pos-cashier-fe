import { DEFAULT_ERROR_MESSAGE } from "@/shared/api/error-message"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import type { Ingredient } from "@/entities/ingredient/model/ingredient.types"
import type { Recipe } from "@/entities/recipe/model/recipe.types"
import { recipeService } from "@/modules/owner/recipe/api/recipe.service"
import { formatQuantity, recipeLineAmount } from "@/modules/owner/recipe/lib/recipe-format"
import {
  convertUnit,
  getSmallestUnit,
  getUnitOptions,
  roundUnitValue,
} from "@/modules/owner/recipe/lib/unit-conversion"
import { recipeRowSchema, type RecipeRowFormValues } from "@/modules/owner/recipe/schemas/recipe.schema"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/ui/confirm-dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form"
import { InfoTip } from "@/shared/ui/info-tip"
import { NumberInput } from "@/shared/ui/number-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

interface RecipeSectionProps {
  menuId: number
  // null = "Semua penyajian" (lines that always apply); otherwise the addon
  // option (e.g. "Ice") the lines are limited to.
  optionId: number | null
  title: string
  description?: string
  // Shown while the block has no lines: what to put here.
  emptyHint: string
  rows: Recipe[]
  // Every ingredient (inactive ones included, so existing lines still resolve).
  ingredients: Ingredient[]
  recipesQueryKey: unknown[]
  // Only for a serving block opened by mistake that has no lines: closes it.
  onClose?: () => void
}

// A small visible caption above a field of the add row.
function FieldCaption({ children }: { children: string }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>
}

// One block of recipe lines: either the lines shared by every serving, or the
// lines that only apply when one serving option (Hot / Ice ...) is ordered.
// Each block has its own ingredient picker, since the same ingredient may
// appear once per block (e.g. coffee for every serving, ice only for Ice).
export function RecipeSection({
  menuId,
  optionId,
  title,
  description,
  emptyHint,
  rows,
  ingredients,
  recipesQueryKey,
  onClose,
}: RecipeSectionProps) {
  const queryClient = useQueryClient()
  const [confirmClear, setConfirmClear] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingQuantity, setEditingQuantity] = useState("")
  const [editingUnit, setEditingUnit] = useState("")

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
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => recipeService.update(id, { quantity }),
    onSuccess: () => {
      toast.success("Jumlah resep diperbarui")
      setEditingId(null)
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  // A recipe line is part of the menu's composition, not master data, so it can
  // really be removed.
  const removeMutation = useMutation({
    mutationFn: (id: number) => recipeService.remove(id),
    onSuccess: () => {
      toast.success("Bahan baku dihapus dari resep")
      invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  // "Hapus semua": for a block (e.g. a serving's recipe) that is not wanted after all.
  const clearMutation = useMutation({
    mutationFn: () => Promise.all(rows.map((row) => recipeService.remove(row.id ?? 0))),
    onSuccess: () => {
      toast.success("Semua bahan di bagian ini dihapus")
      setConfirmClear(false)
      invalidate()
    },
    onError: (error) => {
      toast.error(errorMessage(error))
      invalidate()
    },
  })

  const form = useCrudForm({
    schema: recipeRowSchema,
    defaultValues: { ingredientId: "", quantity: "", unit: "" },
  })

  const usedIngredientIds = new Set(rows.map((row) => row.ingredient_id))
  // Inactive ingredients stay visible on existing lines but aren't offered for
  // new ones; an ingredient already used in THIS block isn't offered twice.
  const availableIngredients = ingredients.filter(
    (ingredient) => !usedIngredientIds.has(ingredient.id) && ingredient.status !== "inactive"
  )

  const selectedIngredientId = form.watch("ingredientId")
  const selectedIngredient = availableIngredients.find((ingredient) => String(ingredient.id) === selectedIngredientId)
  const entryUnitOptions = getUnitOptions(selectedIngredient?.unit)
  const enteredQuantity = Number(form.watch("quantity"))
  const enteredUnit = form.watch("unit")

  // Default the entry unit to the smallest/friendliest unit in the chosen
  // ingredient's group (e.g. picking "Biji Kopi" tracked in "kg" defaults the
  // entry unit to "gram") whenever the selected ingredient changes.
  useEffect(() => {
    if (selectedIngredient) {
      form.setValue("unit", getSmallestUnit(selectedIngredient.unit))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIngredientId])

  // What the line being typed means: the amount in the ingredient's own (stock)
  // unit, and how many servings the current stock covers.
  const preview = (() => {
    if (!selectedIngredient || !enteredUnit || !(enteredQuantity > 0)) return null
    const stockUnit = selectedIngredient.unit ?? enteredUnit
    const inStockUnit = convertUnit(enteredQuantity, enteredUnit, stockUnit)
    if (!(inStockUnit > 0)) return null
    const stock = selectedIngredient.stock ?? 0
    return {
      converted: enteredUnit !== stockUnit ? `${formatQuantity(enteredQuantity)} ${enteredUnit} = ${formatQuantity(inStockUnit)} ${stockUnit}` : null,
      stockUnit,
      stock,
      servings: stock > 0 ? Math.floor(stock / inStockUnit) : 0,
    }
  })()

  function handleAdd(values: RecipeRowFormValues) {
    if (!selectedIngredient) return
    const quantityInIngredientUnit = convertUnit(
      Number(values.quantity),
      values.unit,
      selectedIngredient.unit ?? values.unit
    )
    if (!(quantityInIngredientUnit > 0)) {
      toast.error("Jumlah harus lebih dari 0")
      return
    }
    createMutation.mutate({
      menu_id: menuId,
      ingredient_id: Number(values.ingredientId),
      quantity: quantityInIngredientUnit,
      addon_option_id: optionId,
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {description && <InfoTip label={title}>{description}</InfoTip>}
        </div>
        {rows.length > 0 ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="shrink-0 cursor-pointer text-xs font-semibold text-destructive underline underline-offset-2"
          >
            Hapus semua
          </button>
        ) : (
          onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={`Tutup ${title}`}
              className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              <XIcon className="size-3.5" />
              Tutup
            </button>
          )
        )}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">{emptyHint}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => {
            const { qty, unit, rawQty, rawUnit } = recipeLineAmount(row)
            const showRaw = unit !== rawUnit

            return (
              <div key={row.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                <span className="text-sm font-medium text-foreground">{row.ingredient_name}</span>

                {editingId === row.id ? (
                  <div className="flex items-center gap-1.5">
                    <NumberInput
                      decimals={3}
                      maxDigits={9}
                      value={editingQuantity}
                      onValueChange={setEditingQuantity}
                      // This input sits inside the menu <form>: Enter would
                      // submit (and close) the whole menu drawer.
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          saveEdit(row)
                        } else if (event.key === "Escape") {
                          event.preventDefault()
                          event.stopPropagation()
                          setEditingId(null)
                        }
                      }}
                      className="h-8 w-20"
                      autoFocus
                    />
                    <Select value={editingUnit} onValueChange={handleEditingUnitChange}>
                      <SelectTrigger className="h-8 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnitOptions(rawUnit).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      aria-label="Simpan jumlah"
                      onClick={() => saveEdit(row)}
                      disabled={updateMutation.isPending}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <CheckIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Batal ubah jumlah"
                      onClick={() => setEditingId(null)}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">
                      {formatQuantity(qty)} {unit}
                      {showRaw && (
                        <span className="ml-1 text-xs text-muted-foreground/70">
                          ({formatQuantity(rawQty)} {rawUnit})
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label={`Ubah jumlah ${row.ingredient_name}`}
                      onClick={() => startEdit(row)}
                      className="flex size-7 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Hapus ${row.ingredient_name} dari resep`}
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
        {/* A <div>, not a <form>: this block renders inside the menu <form>, and a nested
            submit would bubble up and submit (then close) the menu drawer. */}
        <div className="flex flex-col gap-2 border-t pt-3">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-foreground">Tambah bahan</p>
            <InfoTip label="Tambah bahan">
              Pilih bahan baku dulu; satuannya terisi otomatis (gram untuk bahan kg, ml untuk bahan liter) dan bisa diganti.
            </InfoTip>
          </div>

          {/* Bahan on its own row, then jumlah · satuan · Tambah on the next. Every
              field has a visible caption. */}
          <div className="flex flex-wrap items-start gap-2">
            <FormField
              control={form.control}
              name="ingredientId"
              render={({ field }) => (
                <FormItem className="basis-full gap-1">
                  <FieldCaption>1. Bahan baku</FieldCaption>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih bahan baku" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableIngredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                          {ingredient.name} — stok {formatQuantity(ingredient.stock ?? 0)} {ingredient.unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="min-w-28 flex-1 gap-1">
                  <FieldCaption>2. Jumlah per porsi</FieldCaption>
                  <FormControl>
                    <NumberInput
                      decimals={3}
                      maxDigits={9}
                      placeholder="mis. 18"
                      disabled={!selectedIngredient}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          void form.handleSubmit(handleAdd)()
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="w-28 gap-1">
                  <FieldCaption>Satuan</FieldCaption>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedIngredient}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="—" />
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

            <div className="flex flex-col gap-1">
              {/* Same height as a caption so the button lines up with the inputs. */}
              <span aria-hidden className="text-xs">
                &nbsp;
              </span>
              <Button
                type="button"
                onClick={() => void form.handleSubmit(handleAdd)()}
                disabled={createMutation.isPending || !selectedIngredient}
              >
                <PlusIcon />
                Tambah
              </Button>
            </div>
          </div>

          {!selectedIngredient ? null : preview ? (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Setiap 1 porsi memakai <span className="font-semibold text-foreground">{preview.converted ?? `${formatQuantity(enteredQuantity)} ${enteredUnit}`}</span>
              .{" "}
              {preview.stock > 0
                ? `Stok sekarang ${formatQuantity(preview.stock)} ${preview.stockUnit}, cukup untuk sekitar ${formatQuantity(preview.servings)} porsi.`
                : "Stok bahan ini masih 0 — isi lewat Riwayat Stok → Ubah Stok → Stok Masuk."}
            </p>
          ) : null}
        </div>
      </Form>

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title={`Hapus semua bahan di "${title}"?`}
        description={`${rows.length} bahan akan dihapus dari resep. Stok yang sudah terpotong oleh pesanan sebelumnya tidak berubah.`}
        isPending={clearMutation.isPending}
        onConfirm={() => clearMutation.mutate()}
      />
    </div>
  )
}

function errorMessage(error: unknown): string {
  if (error instanceof CrudServiceError) return error.message
  return DEFAULT_ERROR_MESSAGE
}
