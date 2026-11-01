import type { ClipboardEvent, ChangeEvent, FocusEvent } from "react"

import {
  caretForSignificant,
  countSignificant,
  formatNumberText,
  normalizeRaw,
  pastedToDisplay,
  sanitizeNumberText,
  type NumberFieldOptions,
} from "@/shared/lib/number-input"

interface UseNumberFieldArgs extends NumberFieldOptions {
  // Raw value kept in the form: "28000", "1250.5", "-3", "" (a number literal,
  // so `Number(value)` and the zod schemas keep working).
  value: string
  onValueChange: (raw: string) => void
  // Largest allowed value; typing past it is ignored.
  max?: number
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
}

// Shared behaviour of every number field (NumberInput, AffixInput): shows the
// raw value as "1.250,5" while typing, keeps the caret where the user is
// typing even though separators appear, and understands pasted "Rp 1.250.000".
// Spread `inputProps` onto the <input>.
export function useNumberField({
  value,
  onValueChange,
  decimals = 0,
  allowNegative = false,
  maxDigits,
  group = true,
  max,
  onBlur,
}: UseNumberFieldArgs) {
  const options: NumberFieldOptions = { decimals, allowNegative, maxDigits, group }
  const display = formatNumberText(value ?? "", group)

  function apply(input: HTMLInputElement, text: string, caret: number) {
    const raw = sanitizeNumberText(text, options)
    const significantBefore = countSignificant(text.slice(0, caret))
    const rejected = max != null && raw !== "" && raw !== "-" && Number(raw) > max

    if (!rejected && raw !== value) onValueChange(raw)
    const shown = rejected ? display : formatNumberText(raw, group)

    // Put the caret back after the same number of digits once React has
    // re-rendered the formatted text (it would otherwise jump to the end).
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return
      const position = caretForSignificant(shown, significantBefore)
      input.setSelectionRange(position, position)
    })
  }

  return {
    display,
    inputProps: {
      value: display,
      inputMode: allowNegative ? ("text" as const) : decimals > 0 ? ("decimal" as const) : ("numeric" as const),
      autoComplete: "off",
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget
        apply(input, input.value, input.selectionStart ?? input.value.length)
      },
      onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
        const input = event.currentTarget
        event.preventDefault()
        const pasted = pastedToDisplay(event.clipboardData.getData("text"), decimals)
        const start = input.selectionStart ?? input.value.length
        const end = input.selectionEnd ?? start
        apply(input, `${input.value.slice(0, start)}${pasted}${input.value.slice(end)}`, start + pasted.length)
      },
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        // "1," or a lone "-" left behind when the user tabs away.
        const settled = normalizeRaw(value ?? "")
        if (settled !== value) onValueChange(settled)
        onBlur?.(event)
      },
    },
  }
}
