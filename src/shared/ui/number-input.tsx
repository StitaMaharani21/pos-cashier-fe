import type { ComponentProps } from "react"

import { useNumberField } from "@/shared/hooks/useNumberField"
import { Input } from "@/shared/ui/input"

type NumberInputProps = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur" | "type" | "inputMode" | "min" | "max" | "step" | "maxLength"
> & {
  // Raw number kept in the form, e.g. "28000", "1250.5", "-3" or "".
  value: string
  onValueChange: (raw: string) => void
  onBlur?: ComponentProps<typeof Input>["onBlur"]
  // Digits allowed after the decimal comma; 0 (default) = whole numbers.
  decimals?: number
  // Allow a leading minus sign (e.g. a stock correction down).
  allowNegative?: boolean
  // Max digits in the whole part.
  maxDigits?: number
  // Largest allowed value.
  max?: number
  // false = no "." between thousands (counts, percent).
  group?: boolean
  // A bare <input> without the Input box styling, for fields that sit inside
  // a box the form draws itself (an "Rp" prefix, a "pcs" suffix, an icon).
  bare?: boolean
}

// A text field for amounts and quantities that shows Indonesian separators
// while typing: 1.000, 10.000, 1.250.000 and a decimal comma (1.250,5). The
// form keeps the plain number ("1250.5"), so schemas and `Number(value)` at
// submit are unchanged. Not for codes, phone or account numbers.
//
//   <NumberInput value={field.value} onValueChange={field.onChange} />
function NumberInput({
  value,
  onValueChange,
  onBlur,
  decimals,
  allowNegative,
  maxDigits,
  max,
  group,
  bare,
  ...props
}: NumberInputProps) {
  const { inputProps } = useNumberField({ value, onValueChange, onBlur, decimals, allowNegative, maxDigits, max, group })
  if (bare) return <input type="text" {...props} {...inputProps} />
  return <Input type="text" {...props} {...inputProps} />
}

export { NumberInput }
