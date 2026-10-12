// "Rp46.000" — the landing mocks follow the brief's compact format, not
// Intl's "Rp 46.000" (which inserts a non-breaking space).
export function rp(value: number): string {
  return `Rp${String(Math.abs(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
}
