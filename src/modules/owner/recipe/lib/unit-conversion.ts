// Best-effort unit conversion for the recipe form. The backend has no UOM
// table — `Ingredient.unit` is free text and `Recipe.quantity` is always
// interpreted directly in that unit, with no conversion of its own (see
// modules/owner/recipe/README.md). This lets someone track an ingredient's
// stock in "kg" while entering a recipe's per-serving amount in "gram" (or
// "liter"/"ml"), converting to the ingredient's own unit before the payload
// is sent. Only mass (gram/kg) and volume (ml/liter) are supported — any
// other unit (e.g. "pcs", "dus") has no known conversion and is left as-is.

type UnitGroup = "mass" | "volume"

const ALIASES: Record<string, "gram" | "kg" | "ml" | "liter"> = {
  gram: "gram",
  gr: "gram",
  g: "gram",
  kilogram: "kg",
  kg: "kg",
  ml: "ml",
  mililiter: "ml",
  milliliter: "ml",
  liter: "liter",
  litre: "liter",
  l: "liter",
}

// Multiplier to the group's canonical smallest unit (gram for mass, ml for volume).
const CANONICAL: Record<"gram" | "kg" | "ml" | "liter", { group: UnitGroup; factor: number }> = {
  gram: { group: "mass", factor: 1 },
  kg: { group: "mass", factor: 1000 },
  ml: { group: "volume", factor: 1 },
  liter: { group: "volume", factor: 1000 },
}

const GROUP_UNITS: Record<UnitGroup, ("gram" | "kg" | "ml" | "liter")[]> = {
  mass: ["gram", "kg"],
  volume: ["ml", "liter"],
}

function canonicalize(unit: string): "gram" | "kg" | "ml" | "liter" | null {
  return ALIASES[unit.trim().toLowerCase()] ?? null
}

export function getUnitGroup(unit: string | undefined | null): UnitGroup | null {
  if (!unit) return null
  const canon = canonicalize(unit)
  return canon ? CANONICAL[canon].group : null
}

// Every convertible unit sharing `unit`'s group, smallest-first — falls back
// to just `[unit]` when it isn't a recognized mass/volume unit (no
// conversion possible, e.g. "pcs").
export function getUnitOptions(unit: string | undefined | null): string[] {
  const group = getUnitGroup(unit)
  if (!group) return unit ? [unit] : []
  return GROUP_UNITS[group]
}

// The smallest/most granular convertible unit in `unit`'s group (e.g.
// "gram" for any mass unit) — used as the default, friendliest entry/display
// unit. Falls back to `unit` itself when unrecognized.
export function getSmallestUnit(unit: string | undefined | null): string {
  const group = getUnitGroup(unit)
  if (!group) return unit ?? ""
  return GROUP_UNITS[group][0]
}

// Converts `value` from `fromUnit` to `toUnit`. Falls back to an identity
// conversion (no-op) when either unit is unrecognized or they aren't in the
// same group — callers should only offer convertible pairs via
// getUnitOptions, but this keeps the function safe either way.
export function convertUnit(value: number, fromUnit: string, toUnit: string): number {
  const from = canonicalize(fromUnit)
  const to = canonicalize(toUnit)
  if (!from || !to || CANONICAL[from].group !== CANONICAL[to].group) return value
  return roundUnitValue((value * CANONICAL[from].factor) / CANONICAL[to].factor)
}

// Recipe.quantity is decimal(18,3) on the backend — round to the same
// precision to avoid floating-point artifacts (e.g. 0.015000000000000001)
// and to match what the backend would store anyway.
export function roundUnitValue(value: number): number {
  return Math.round(value * 1000) / 1000
}
