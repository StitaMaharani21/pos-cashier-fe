import type { ReactNode } from "react"
import { useFormContext } from "react-hook-form"

import { NAME_MAX } from "@/modules/owner/discount-form/lib/discount-rules"
import type { DiscountBaseValues } from "@/modules/owner/discount-form/schemas/discount-base.schema"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { RequiredMark } from "@/shared/ui/form-section"
import { Input } from "@/shared/ui/input"
import { Switch } from "@/shared/ui/switch"

// "Nama" with its x/50 counter, optional extra fields (the voucher code),
// then the Aktif switch.
export function NameStatusFields({
  nameLabel,
  namePlaceholder,
  statusHint,
  children,
}: {
  nameLabel: string
  namePlaceholder: string
  statusHint: string
  children?: ReactNode
}) {
  const form = useFormContext<DiscountBaseValues>()
  const name = form.watch("name") ?? ""
  const isActive = form.watch("isActive")

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {nameLabel}
              <RequiredMark />
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input placeholder={namePlaceholder} maxLength={NAME_MAX} className="h-11 bg-card pr-16" {...field} />
              </FormControl>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                {name.length}/{NAME_MAX}
              </span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {children}

      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-3 rounded-xl border bg-card px-4 py-3">
            <div className="flex-1">
              <FormLabel className="text-sm font-semibold">{isActive ? "Aktif" : "Nonaktif"}</FormLabel>
              <p className="text-xs text-muted-foreground">{statusHint}</p>
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
    </>
  )
}
