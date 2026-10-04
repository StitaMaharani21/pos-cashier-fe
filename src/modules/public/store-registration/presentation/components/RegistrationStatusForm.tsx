import { LoaderCircle, Lock, Mail, Search } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import type { RegistrationStatusFormValues } from "@/modules/public/store-registration/domain/registration-status.schema"
import { PasswordField, TextField } from "@/modules/public/store-registration/presentation/components/FormFields"

interface RegistrationStatusFormProps {
  form: UseFormReturn<RegistrationStatusFormValues>
  isSubmitting: boolean
  onSubmit: (values: RegistrationStatusFormValues) => void
}

// Email + password are the ones chosen on the registration form — the owner
// has no account before approval, so that's how the backend knows the
// request is theirs.
export function RegistrationStatusForm({ form, isSubmitting, onSubmit }: RegistrationStatusFormProps) {
  const { register, handleSubmit, formState } = form
  const errors = formState.errors

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <TextField
        id="statusEmail"
        label="Email Pendaftaran"
        icon={Mail}
        required
        type="email"
        inputMode="email"
        placeholder="budi@kopitemu.id"
        autoComplete="email"
        registration={register("email")}
        error={errors.email?.message}
      />
      <PasswordField
        id="statusPassword"
        label="Kata Sandi"
        icon={Lock}
        placeholder="Kata sandi yang kamu buat saat mendaftar"
        autoComplete="current-password"
        registration={register("password")}
        error={errors.password?.message}
        hint="Dipakai untuk memastikan pendaftaran ini milikmu."
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neela-primary px-4 py-3.5 text-neela-label-lg font-bold text-neela-on-primary shadow-md transition-all hover:bg-neela-on-primary-fixed-variant active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            <span>Memeriksa...</span>
          </>
        ) : (
          <>
            <Search className="size-5" />
            <span>Cek Status</span>
          </>
        )}
      </button>
    </form>
  )
}
