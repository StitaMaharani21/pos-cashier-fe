import type { ReactNode } from "react"
import { useFormContext } from "react-hook-form"

import { AffixInput } from "@/modules/owner/discount-form/components/AffixInput"
import type { DiscountBaseValues } from "@/modules/owner/discount-form/schemas/discount-base.schema"
import { cn } from "@/shared/lib/utils"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { RequiredMark } from "@/shared/ui/form-section"

const TYPE_OPTIONS = [
  { value: "percent" as const, label: "Persen (%)" },
  { value: "fixed" as const, label: "Nominal (Rp)" },
]

// Persen/Nominal segmented control, then Nilai + Maksimal Potongan (percent
// only — a fixed discount is already its own cap). `children` is the
// minimum rule under it (Minimal Pembelian / Minimal Belanja).
export function DiscountValueFields({ maxHint, children }: { maxHint: string; children?: ReactNode }) {
  const form = useFormContext<DiscountBaseValues>()
  const type = form.watch("type")

  return (
    <>
      <div role="radiogroup" aria-label="Tipe diskon" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={type === option.value}
            onClick={() => {
              form.setValue("type", option.value)
              // "20" as a percent is not "Rp20" — start the value over.
              if (option.value !== type) form.setValue("value", "")
              if (form.formState.isSubmitted) void form.trigger(["value", "maxDiscount"])
            }}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-all",
              type === option.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="value"
          render={({ field, fieldState }) => (
            <FormItem className={cn(type === "fixed" && "sm:col-span-2")}>
              <FormLabel>
                Nilai Diskon
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <AffixInput
                  name={field.name}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  value={field.value}
                  onChange={field.onChange}
                  prefix={type === "fixed" ? "Rp" : undefined}
                  suffix={type === "percent" ? "%" : undefined}
                  grouped={type === "fixed"}
                  maxLength={type === "percent" ? 3 : 12}
                  invalid={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "percent" && (
          <FormField
            control={form.control}
            name="maxDiscount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maksimal Potongan</FormLabel>
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
                    placeholder="Tanpa batas"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">{maxHint}</p>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {children}
    </>
  )
}
