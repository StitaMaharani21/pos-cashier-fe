import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

import { changePassword } from "@/modules/owner/change-password/api/change-password.service"
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/modules/owner/change-password/schemas/change-password.schema"
import { CrudServiceError } from "@/shared/api/crud/types"
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

const FIELDS = [
  { name: "currentPassword", label: "Kata Sandi Saat Ini", autoComplete: "current-password" },
  { name: "newPassword", label: "Kata Sandi Baru", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Ulangi Kata Sandi Baru", autoComplete: "new-password" },
] as const

// Owns its own mutation (unlike ProfileForm) because its backend errors map
// onto specific fields rather than a generic toast.
export function ChangePasswordForm() {
  const form = useCrudForm({
    schema: changePasswordSchema,
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Kata sandi berhasil diganti")
      form.reset()
    },
    onError: (error) => {
      if (error instanceof CrudServiceError && error.code === "INVALID_CURRENT_PASSWORD") {
        form.setError("currentPassword", { message: "Kata sandi saat ini salah" })
        return
      }
      if (error instanceof CrudServiceError && error.code === "SAME_PASSWORD") {
        form.setError("newPassword", {
          message: "Kata sandi baru harus berbeda dari yang lama",
        })
        return
      }
      toast.error(error instanceof CrudServiceError ? error.message : "Kata sandi belum berhasil diganti. Coba lagi.")
    },
  })

  function handleSubmit(values: ChangePasswordFormValues) {
    mutation.mutate({
      current_password: values.currentPassword,
      new_password: values.newPassword,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Ganti Kata Sandi</h2>
          <p className="text-xs text-muted-foreground">Minimal 8 karakter.</p>
        </div>

        {FIELDS.map((item) => (
          <FormField
            key={item.name}
            control={form.control}
            name={item.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{item.label}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete={item.autoComplete} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button type="submit" disabled={mutation.isPending} className="self-start">
          {mutation.isPending ? "Menyimpan..." : "Ganti Kata Sandi"}
        </Button>
      </form>
    </Form>
  )
}
