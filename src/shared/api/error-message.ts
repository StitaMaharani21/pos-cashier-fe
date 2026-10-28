import { ApiError, NETWORK_ERROR_MESSAGE, NetworkError } from "@/shared/api/client"

export const DEFAULT_ERROR_MESSAGE = "Maaf, ada yang tidak berjalan. Coba lagi sebentar lagi."

// Pesan error backend tidak pernah ditampilkan apa adanya: sebagian berbahasa
// Inggris dan berisi istilah teknis. Pemetaan spesifik per fitur (kode →
// kalimat) tetap ditulis di service masing-masing; ini hanya jaring pengaman
// berdasarkan status HTTP dan pola kode.
export function friendlyErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
  if (error instanceof NetworkError) return NETWORK_ERROR_MESSAGE
  if (!(error instanceof ApiError)) return fallback

  if (error.code === "VOUCHER_START_DATE_PAST") {
    return "Tanggal mulai tidak boleh sebelum hari ini."
  }

  if (/DUPLICATE|ALREADY_EXISTS|CONFLICT|IN_USE/.test(error.code)) {
    return "Sudah ada data yang sama, atau data ini sedang dipakai di tempat lain."
  }

  switch (error.status) {
    case 400:
    case 422:
      return "Isian belum sesuai. Periksa lagi, lalu coba kembali."
    case 401:
      return "Sesi Anda sudah berakhir. Silakan masuk lagi."
    case 403:
      return "Anda tidak punya izin untuk melakukan ini. Hubungi pemilik toko bila perlu."
    case 404:
      return "Data tidak ditemukan."
    case 409:
      return "Sudah ada data yang sama, atau data ini sedang dipakai di tempat lain."
    case 429:
      return "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi."
  }
  if (error.status !== undefined && error.status >= 500) {
    return "Layanan sedang bermasalah. Coba lagi sebentar lagi."
  }
  return fallback
}
