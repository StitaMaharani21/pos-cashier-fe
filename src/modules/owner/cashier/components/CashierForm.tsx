import { useState } from "react"

import type { CreateCashierPayload } from "@/entities/cashier/model/cashier.types"
import { cashierSchema, type CashierFormValues } from "@/modules/owner/cashier/schemas/cashier.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { AvatarPicker } from "@/shared/ui/avatar-picker"
import { Input } from "@/shared/ui/input"

interface CashierFormProps {
  isSubmitting: boolean
  // photo is optional and uploaded after the account exists.
  onSubmit: (payload: CreateCashierPayload, photo: File | null) => void
}

export function CashierForm({ isSubmitting, onSubmit }: CashierFormProps) {
  const form = useCrudForm({
    schema: cashierSchema,
    defaultValues: { name: "", username: "", pin: "", phoneNo: "" },
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const name = form.watch("name")

  function handleSubmit(values: CashierFormValues) {
    onSubmit(
      {
        name: values.name,
        username: values.username,
        pin: values.pin,
        phone_no: values.phoneNo ?? "",
      },
      photo
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Foto Profil</span>
          <AvatarPicker name={name} onChange={setPhoto} />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kasir</FormLabel>
              <FormControl>
                <Input placeholder="Budi Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="budi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PIN (6 digit)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. HP</FormLabel>
              <FormControl>
                <Input placeholder="08123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Menyimpan..." : "Tambah Kasir"}
        </Button>
      </form>
    </Form>
  )
}
