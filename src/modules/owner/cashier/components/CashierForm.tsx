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
import { Input } from "@/shared/ui/input"

interface CashierFormProps {
  isSubmitting: boolean
  onSubmit: (values: { name: string; username: string; pin: string; phone_no: string }) => void
}

export function CashierForm({ isSubmitting, onSubmit }: CashierFormProps) {
  const form = useCrudForm({
    schema: cashierSchema,
    defaultValues: { name: "", username: "", pin: "", phoneNo: "" },
  })

  function handleSubmit(values: CashierFormValues) {
    onSubmit({
      name: values.name,
      username: values.username,
      pin: values.pin,
      phone_no: values.phoneNo ?? "",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
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
