import type { ReactNode, Ref } from "react"

import { useNumberField } from "@/shared/hooks/useNumberField"
import { cn } from "@/shared/lib/utils"

// Number input with an optional "Rp" prefix / "%" suffix box. The value stays a
// plain number string ("10000"); `grouped` shows it as "10.000" (the shared
// useNumberField behaviour: caret kept, paste understood, decimals optional).
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
  decimals,
  allowNegative,
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
  // Max digits of the whole part (not the length of the displayed text).
  maxLength?: number
  // Digits allowed after the decimal comma; default whole numbers.
  decimals?: number
  allowNegative?: boolean
  disabled?: boolean
  invalid?: boolean
  id?: string
}) {
  const { inputProps } = useNumberField({
    value,
    onValueChange: onChange,
    onBlur: () => onBlur?.(),
    decimals,
    allowNegative,
    maxDigits: maxLength,
    group: grouped,
  })

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
        {...inputProps}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent px-3 text-sm outline-none"
        name={name}
        ref={inputRef}
        disabled={disabled}
        aria-invalid={invalid || undefined}
      />
      {suffix && (
        <span className="flex items-center border-l bg-muted px-3.5 text-sm text-muted-foreground">{suffix}</span>
      )}
    </div>
  )
}
