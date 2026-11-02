// The units a bahan baku can be counted in. A fixed list (the form is a
// dropdown, never free text) so the same thing is not saved as "kg", "Kg",
// "kilo" and "kgs", which would split the stock figures, the recipes and the
// reports. Stored as the plain label — the backend column is still a string.
export const INGREDIENT_UNITS = [
  "gram",
  "kg",
  "ml",
  "liter",
  "pcs",
  "butir",
  "lembar",
  "bungkus",
  "sachet",
  "botol",
  "kaleng",
  "dus",
  "box",
] as const
