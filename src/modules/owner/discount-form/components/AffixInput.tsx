import type { ReactNode, Ref } from "react"

import { cn } from "@/shared/lib/utils"

const thousands = new Intl.NumberFormat("id-ID")

// Digits-only text input with an optional "Rp" prefix / "%" suffix box.
// The value stays plain digits ("10000"); `grouped` shows it as "10.000".
export function AffixInput({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  prefix,
  suffix,
  grouped = false,
  placeholder = "0",
  maxLength,
  disabled,
  invalid,
  id,
}: {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  inputRef?: Ref<HTMLInputElement>
  prefix?: ReactNode
  suffix?: ReactNode
  grouped?: boolean
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  invalid?: boolean
  id?: string
}) {
  return (
    <div
      className={cn(
        "flex h-11 overflow-hidden rounded-md border border-input bg-card focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        invalid && "border-destructive",
        disabled && "opacity-60"
      )}
    >
      {prefix && (
        <span className="flex items-center border-r bg-muted px-3.5 text-sm text-muted-foreground">{prefix}</span>
      )}
      <input
        id={id}
        inputMode="numeric"
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent px-3 text-sm outline-none"
        name={name}
        ref={inputRef}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={grouped && value ? thousands.format(Number(value)) : value}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "")
          onChange(maxLength ? digits.slice(0, maxLength) : digits)
        }}
      />
      {suffix && (
        <span className="flex items-center border-l bg-muted px-3.5 text-sm text-muted-foreground">{suffix}</span>
      )}
    </div>
  )
}
