import { useState, type InputHTMLAttributes } from "react"
import { Eye, EyeOff, type LucideIcon } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"

import { cn } from "@/shared/lib/utils"

const INPUT =
  "w-full rounded-xl bg-neela-surface-container-lowest py-2.5 text-neela-body-md text-neela-on-surface shadow-sm placeholder:text-neela-outline focus:ring-2 focus:ring-neela-primary focus:outline-none"

interface FieldShellProps {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}

function FieldShell({ id, label, required, hint, error, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-neela-label-md text-neela-on-surface">
        {label} {required ? <span className="text-neela-error">*</span> : <span className="text-neela-outline">(opsional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-neela-error">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-neela-on-surface-variant">{hint}</p>
      )}
    </div>
  )
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string
  label: string
  icon: LucideIcon
  registration: UseFormRegisterReturn
  required?: boolean
  hint?: string
  error?: string
}

// Icon-prefixed input from the Stitch registration form. `required` only
// drives the asterisk — validation lives in the zod schema.
export function TextField({
  id,
  label,
  icon: Icon,
  registration,
  required,
  hint,
  error,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error}>
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-neela-outline" />
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(INPUT, "pr-4 pl-11", error && "ring-2 ring-neela-error", className)}
          {...inputProps}
          {...registration}
        />
      </div>
    </FieldShell>
  )
}

interface PasswordFieldProps {
  id: string
  label: string
  icon: LucideIcon
  placeholder: string
  autoComplete: string
  registration: UseFormRegisterReturn
  error?: string
  hint?: string
  // 0–4 from domain passwordStrength; renders the 4-segment meter when given.
  strength?: { score: number; hasValue: boolean }
}

const STRENGTH_LABEL = ["Kekuatan: Lemah", "Kekuatan: Lemah", "Kekuatan: Cukup baik", "Kekuatan: Cukup baik", "Kekuatan: Sangat aman!"]

function strengthColor(score: number): string {
  if (score <= 1) return "bg-neela-error"
  if (score <= 3) return "bg-neela-primary-container"
  return "bg-neela-tertiary"
}

export function PasswordField({
  id,
  label,
  icon: Icon,
  placeholder,
  autoComplete,
  registration,
  error,
  hint,
  strength,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <FieldShell
      id={id}
      label={label}
      required
      error={error}
      hint={strength?.hasValue ? STRENGTH_LABEL[strength.score] : hint}
    >
      <div className="relative">
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-neela-outline" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(INPUT, "pr-10 pl-11", error && "ring-2 ring-neela-error")}
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-neela-outline hover:text-neela-on-surface"
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
      {strength && (
        <div className="mt-1.5 flex items-center gap-1" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                index < strength.score ? strengthColor(strength.score) : "bg-neela-surface-container"
              )}
            />
          ))}
        </div>
      )}
    </FieldShell>
  )
}
