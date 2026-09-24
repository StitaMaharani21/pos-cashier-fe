import { useState } from "react"

import type { PaymentMethod } from "@/entities/payment-method/model/payment-method.types"
import {
  FIXED_NAME,
  PROVIDER_LABEL,
  providerOptions,
} from "@/modules/owner/payment-method/constants/payment-providers"
import { TYPE_META } from "@/modules/owner/payment-method/constants/payment-type-meta"
import {
  PAYMENT_METHOD_TYPES,
  PAYMENT_METHOD_TYPE_LABELS,
  paymentMethodSchema,
  type PaymentMethodFormValues,
} from "@/modules/owner/payment-method/schemas/payment-method.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { ImageUpload } from "@/shared/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface PaymentMethodFormPayload {
  name: string
  type: PaymentMethodFormValues["type"]
  status: string
  image?: File | null
}

interface PaymentMethodFormProps {
  row: PaymentMethod | null
  // All saved methods — providers already registered for the chosen type are
  // shown disabled so the same one can't be added twice.
  existing: PaymentMethod[]
  isSubmitting: boolean
  onSubmit: (payload: PaymentMethodFormPayload) => void
  onCancel: () => void
}

export function PaymentMethodForm({
  row,
  existing,
  isSubmitting,
  onSubmit,
  onCancel,
}: PaymentMethodFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  const form = useCrudForm({
    schema: paymentMethodSchema,
    defaultValues: {
      name: row?.name ?? FIXED_NAME.cash ?? "",
      type: (row?.type as PaymentMethodFormValues["type"]) ?? "cash",
      status: (row?.status as "active" | "inactive") ?? "active",
    },
  })

  const type = form.watch("type")
  const options = providerOptions(type)
  // A row saved back when the name was free text may not match any list
  // entry — keep it selectable so editing just the status doesn't wipe it.
  const legacyName =
    options && row?.name && row.type === type && !options.includes(row.name) ? row.name : null

  const takenNames = new Set(
    existing
      .filter((method) => method.type === type && method.id !== row?.id)
      .map((method) => method.name?.toLowerCase())
  )

  function selectType(next: PaymentMethodFormValues["type"]) {
    form.setValue("type", next)
    // Reset the provider so e.g. "BCA" doesn't carry over into E-Wallet;
    // restore the row's own name when switching back to its saved type.
    const name = next === row?.type ? (row?.name ?? "") : (FIXED_NAME[next] ?? "")
    form.setValue("name", name, { shouldValidate: form.formState.isSubmitted })
  }

  function handleSubmit(values: PaymentMethodFormValues) {
    if (values.type === "qris" && !imageFile && !row?.image_url) {
      setImageError("Wajib unggah gambar QRIS")
      return
    }
    setImageError(null)
    onSubmit({ ...values, image: imageFile })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe</FormLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PAYMENT_METHOD_TYPES.map((option) => {
                  const meta = TYPE_META[option]
                  const Icon = meta.icon
                  const active = field.value === option
                  return (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectType(option)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-lg text-white",
                          meta.className
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      {PAYMENT_METHOD_TYPE_LABELS[option]}
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {options && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{PROVIDER_LABEL[type]}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`${PROVIDER_LABEL[type]}...`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {legacyName && <SelectItem value={legacyName}>{legacyName}</SelectItem>}
                    {options.map((option) => {
                      const taken = takenNames.has(option.toLowerCase())
                      return (
                        <SelectItem key={option} value={option} disabled={taken}>
                          {taken ? `${option} (sudah ada)` : option}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "qris" && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Gambar QRIS
            </span>
            <ImageUpload
              value={row?.image_url}
              onChange={(file) => {
                setImageFile(file)
                if (file) setImageError(null)
              }}
              hint="PNG/JPG/WEBP, maks 2MB — wajib untuk QRIS"
            />
            {imageError && <p className="text-sm text-destructive">{imageError}</p>}
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
