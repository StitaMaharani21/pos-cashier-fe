import { ApiError, NETWORK_ERROR_MESSAGE, NetworkError } from "@/shared/api/client"

export const DEFAULT_ERROR_MESSAGE = "Terjadi kesalahan. Coba lagi."

// Pesan error backend tidak pernah ditampilkan apa adanya: sebagian berbahasa
// Inggris dan berisi istilah teknis. Pemetaan spesifik per fitur (kode →
// kalimat) tetap ditulis di service masing-masing; ini hanya jaring pengaman
// berdasarkan status HTTP dan pola kode.
export function friendlyErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof NetworkError) return NETWORK_ERROR_MESSAGE
  if (!(error instanceof ApiError)) return fallback

  if (/DUPLICATE|ALREADY_EXISTS|CONFLICT|IN_USE/.test(error.code)) {
    return "Data ini sudah ada atau sedang dipakai."
  }

  switch (error.status) {
    case 400:
    case 422:
      return "Data yang diisi belum sesuai. Periksa lagi, lalu coba kembali."
    case 401:
      return "Masa login Anda sudah habis. Silakan masuk lagi."
    case 403:
      return "Anda tidak punya akses untuk melakukan ini."
    case 404:
      return "Data tidak ditemukan."
    case 409:
      return "Data ini sudah ada atau sedang dipakai."
    case 429:
      return "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi."
  }
  if (error.status !== undefined && error.status >= 500) {
    return "Sedang ada gangguan di sistem kami. Coba lagi sebentar lagi."
  }
  return fallback
}
