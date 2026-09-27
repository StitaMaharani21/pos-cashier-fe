import type { ReactNode } from "react"
import { CalendarIcon, InfinityIcon } from "lucide-react"
import { useFormContext } from "react-hook-form"

import {
  activePreset,
  PERIOD_PRESETS,
  presetRange,
} from "@/modules/owner/discount-form/lib/discount-rules"
import type { DiscountBaseValues } from "@/modules/owner/discount-form/schemas/discount-base.schema"
import { cn } from "@/shared/lib/utils"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { RequiredMark } from "@/shared/ui/form-section"

function DateBox({ children, invalid }: { children: ReactNode; invalid?: boolean }) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-2 rounded-md border border-input bg-card px-3 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        invalid && "border-destructive"
      )}
    >
      {children}
    </div>
  )
}

// Tanggal mulai / selesai + the Hari ini · 7 hari · 30 hari · Tanpa batas
// presets. An empty end date means "tanpa batas" (the backend never expires
// it). `children` goes under it (the "Atur hari & jam" panel).
export function PeriodFields({ children }: { children?: ReactNode }) {
  const form = useFormContext<DiscountBaseValues>()
  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")
  const preset = activePreset(startDate, endDate)
  const openEnded = !endDate

  function applyPreset(value: (typeof PERIOD_PRESETS)[number]["value"]) {
    const range = presetRange(value, startDate)
    const validate = form.formState.isSubmitted
    form.setValue("startDate", range.startDate, { shouldValidate: validate })
    form.setValue("endDate", range.endDate, { shouldValidate: validate })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {PERIOD_PRESETS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={preset === option.value}
            onClick={() => applyPreset(option.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              preset === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>
                Tanggal Mulai
                <RequiredMark />
              </FormLabel>
              <DateBox invalid={!!fieldState.error}>
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <FormControl>
                  <input type="date" className="w-full min-w-0 bg-transparent text-sm outline-none" {...field} />
                </FormControl>
              </DateBox>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Tanggal Selesai</FormLabel>
              {openEnded ? (
                // Clicking "Tanpa batas" back into a date: default to the start.
                <button
                  type="button"
                  onClick={() => form.setValue("endDate", startDate, { shouldValidate: form.formState.isSubmitted })}
                  className="flex h-11 w-full items-center gap-2 rounded-md border border-dashed bg-card px-3 text-left text-sm text-muted-foreground hover:border-primary/40"
                >
                  <InfinityIcon className="size-4 shrink-0" />
                  Tanpa batas
                  <span className="ml-auto text-xs text-primary">Atur tanggal</span>
                </button>
              ) : (
                <DateBox invalid={!!fieldState.error}>
                  <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                  <FormControl>
                    <input
                      type="date"
                      min={startDate || undefined}
                      className="w-full min-w-0 bg-transparent text-sm outline-none"
                      {...field}
                    />
                  </FormControl>
                </DateBox>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {children}
    </>
  )
}
