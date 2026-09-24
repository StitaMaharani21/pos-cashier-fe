import { z } from "zod"

import type { SubmitRegistrationPayload } from "@/modules/public/store-registration/domain/store-registration.types"

// Mirrors pos-kasir-be's dto.SubmitRegistrationRequest bindings field by
// field (store_name 3–150, address ≤255, phone_no ≤30, owner_name 3–150,
// owner_username 3–100, owner_email email ≤150, owner_phone_no optional ≤30,
// password ≥8). The password confirmation and consent checkbox are
// client-side only.
export const storeRegistrationSchema = z
  .object({
    storeName: z
      .string()
      .trim()
      .min(3, "Nama usaha minimal 3 karakter")
      .max(150, "Nama usaha maksimal 150 karakter"),
    address: z
      .string()
      .trim()
      .min(1, "Alamat toko wajib diisi")
      .max(255, "Alamat maksimal 255 karakter"),
    phoneNo: z
      .string()
      .trim()
      .min(1, "Nomor telepon toko wajib diisi")
      .max(30, "Nomor telepon maksimal 30 karakter"),
    ownerName: z
      .string()
      .trim()
      .min(3, "Nama pemilik minimal 3 karakter")
      .max(150, "Nama pemilik maksimal 150 karakter"),
    ownerUsername: z
      .string()
      .trim()
      .min(3, "Username minimal 3 karakter")
      .max(100, "Username maksimal 100 karakter"),
    ownerEmail: z
      .string()
      .trim()
      .email("Email tidak valid")
      .max(150, "Email maksimal 150 karakter"),
    ownerPhoneNo: z.string().trim().max(30, "Nomor WhatsApp maksimal 30 karakter"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Ulangi kata sandi"),
    consent: z.boolean().refine((value) => value, "Centang persetujuan untuk melanjutkan"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Kata sandi belum sama",
  })

export type StoreRegistrationFormValues = z.infer<typeof storeRegistrationSchema>

export const EMPTY_REGISTRATION_FORM: StoreRegistrationFormValues = {
  storeName: "",
  address: "",
  phoneNo: "",
  ownerName: "",
  ownerUsername: "",
  ownerEmail: "",
  ownerPhoneNo: "",
  password: "",
  confirmPassword: "",
  consent: false,
}

export function toSubmitPayload(values: StoreRegistrationFormValues): SubmitRegistrationPayload {
  return {
    store_name: values.storeName,
    address: values.address,
    phone_no: values.phoneNo,
    owner_name: values.ownerName,
    owner_username: values.ownerUsername,
    // The backend lowercases it too — done here so the success screen shows
    // exactly the email the owner will log in with.
    owner_email: values.ownerEmail.toLowerCase(),
    owner_phone_no: values.ownerPhoneNo,
    password: values.password,
  }
}

// 0–4, one point each for: length ≥ 8, an uppercase letter, a digit, a
// symbol — the Stitch design's strength meter. Advisory only; the backend
// just requires ≥ 8 characters.
export function passwordStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}
