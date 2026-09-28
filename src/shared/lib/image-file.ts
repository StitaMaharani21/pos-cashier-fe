// The limits the backend enforces for every uploaded image (menu photo,
// business logo, cashier photo): jpeg / png / webp, ≤ 2MB. Checked client
// side first so the message is instant.
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export function imageFileError(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Format harus PNG, JPG, atau WEBP"
  if (file.size > MAX_IMAGE_BYTES) return "Ukuran foto maksimal 2MB"
  return null
}
