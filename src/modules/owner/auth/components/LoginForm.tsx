import { useState } from "react"
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"

import {
  loginSchema,
  type LoginFormValues,
} from "@/modules/owner/auth/schemas/login.schema"
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

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void
  isSubmitting: boolean
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const form = useCrudForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  autoFocus
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kata sandi</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-11 pr-12"
                    {...field}
                  />
                  {/* 16px icon with no hit area of its own was well under the
                      44px touch minimum and had no focus ring. */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2Icon className="animate-spin" aria-hidden />}
          {isSubmitting ? "Sedang masuk..." : "Masuk"}
        </Button>
      </form>
    </Form>
  )
}
