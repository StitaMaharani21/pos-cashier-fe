// Pure helpers behind NumberInput: what the user sees ("1.250,5", Indonesian
// style: "." groups thousands, "," is the decimal mark) versus the raw string
// kept in the form ("1250.5"). The raw string is a plain number literal, so
// zod schemas and `Number(value)` at submit keep working unchanged.

export interface NumberFieldOptions {
  // Max digits after the decimal comma. 0 (default) = whole numbers only.
  decimals?: number
  // Allow one leading minus sign (e.g. a stock correction down).
  allowNegative?: boolean
  // Max digits in the whole part (not counting separators).
  maxDigits?: number
  // Show "." between thousands. false = plain digits (percent, counts).
  group?: boolean
}

const SIGNIFICANT = /[\d,-]/

// What the user typed or pasted -> raw value.
//   "1.250,5" -> "1250.5"   "007" -> "7"   "0,5" -> "0.5"   ",5" -> "0.5"
//   "1," -> "1."  (kept while typing so the comma doesn't vanish; see normalizeRaw)
// "." is always treated as a thousands mark here — that is what the field
// itself shows. A pasted "1.5" is converted first by pastedToDisplay.
export function sanitizeNumberText(text: string, options: NumberFieldOptions = {}): string {
  const { decimals = 0, allowNegative = false, maxDigits } = options
  const negative = allowNegative && text.trim().startsWith("-")

  const [wholeRaw = "", fractionRaw] = text.replace(/[^\d,]/g, "").split(",")
  const hasDecimal = decimals > 0 && fractionRaw !== undefined

  let whole = wholeRaw.replace(/^0+(?=\d)/, "")
  if (maxDigits && whole.length > maxDigits) whole = whole.slice(0, maxDigits)
  if (whole === "" && hasDecimal) whole = "0"
  if (whole === "") return negative ? "-" : ""

  const fraction = hasDecimal ? `.${(fractionRaw ?? "").slice(0, decimals)}` : ""
  return `${negative ? "-" : ""}${whole}${fraction}`
}

// Raw value -> display text.  "1250.5" -> "1.250,5", "-3" -> "-3", "1." -> "1,".
export function formatNumberText(raw: string, group = true): string {
  if (!raw) return ""
  const negative = raw.startsWith("-")
  const body = negative ? raw.slice(1) : raw
  const [whole = "", fraction] = body.split(".")
  const shown = group ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : whole
  return `${negative ? "-" : ""}${shown}${fraction !== undefined ? `,${fraction}` : ""}`
}

// A value left half-typed when the field loses focus: "1." -> "1", "-" -> "".
export function normalizeRaw(raw: string): string {
  if (raw === "-") return ""
  return raw.endsWith(".") ? raw.slice(0, -1) : raw
}

// Clipboard text -> display-style text for sanitizeNumberText. Strips "Rp" and
// spaces. Users paste both "1.250,5" (Indonesian) and "1250.5" (a spreadsheet,
// another site): with a comma present "." is grouping; without one, a single
// "." followed by 1-2 digits (or any count when more than 3, which can't be
// grouping) is a decimal point — but "1.000" is one thousand.
export function pastedToDisplay(clip: string, decimals: number): string {
  const text = clip.replace(/rp/gi, "").replace(/\s+/g, "")
  if (decimals > 0 && !text.includes(",")) {
    const match = text.match(/^(-?\d+)\.(\d+)$/)
    if (match && match[2].length !== 3) return `${match[1]},${match[2]}`
  }
  return text
}

// Characters that carry the number (digits, comma, minus) — separators the
// field adds don't count, so the caret can be put back after reformatting.
export function countSignificant(text: string): number {
  let count = 0
  for (const char of text) if (SIGNIFICANT.test(char)) count += 1
  return count
}

// Caret index in `display` that sits right after `significant` number characters.
export function caretForSignificant(display: string, significant: number): number {
  if (significant <= 0) return 0
  let seen = 0
  for (let index = 0; index < display.length; index += 1) {
    if (SIGNIFICANT.test(display[index] ?? "")) seen += 1
    if (seen === significant) return index + 1
  }
  return display.length
}
