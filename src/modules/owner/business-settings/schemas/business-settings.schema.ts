import { z } from "zod"

export const businessSettingsSchema = z.object({
  businessName: z.string().min(1, "Nama bisnis wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  phoneNo: z.string().min(1, "Nomor telepon wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  // Mirrors the backend's `binding:"gte=0,lte=100"`.
  taxPercentage: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 0 && Number(value) <= 100),
      "Pajak harus antara 0 dan 100"
    ),
  receiptFooter: z.string().optional(),
  // Cafe location for QR-table orders. Kept as strings (text inputs); both
  // coordinates or neither, and the ranges mirror the backend's bindings.
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  selfOrderRadiusM: z.string().optional(),
}).superRefine((values, ctx) => {
  const lat = values.latitude?.trim() ?? ""
  const lng = values.longitude?.trim() ?? ""
  const radius = values.selfOrderRadiusM?.trim() ?? ""

  if ((lat === "") !== (lng === "")) {
    ctx.addIssue({
      code: "custom",
      path: [lat === "" ? "latitude" : "longitude"],
      message: "Garis lintang dan garis bujur harus diisi bersamaan",
    })
  }
  if (lat !== "" && !(Number.isFinite(Number(lat)) && Number(lat) >= -90 && Number(lat) <= 90)) {
    ctx.addIssue({ code: "custom", path: ["latitude"], message: "Garis lintang harus antara -90 dan 90" })
  }
  if (lng !== "" && !(Number.isFinite(Number(lng)) && Number(lng) >= -180 && Number(lng) <= 180)) {
    ctx.addIssue({ code: "custom", path: ["longitude"], message: "Garis bujur harus antara -180 dan 180" })
  }
  if (radius !== "" && !(Number.isInteger(Number(radius)) && Number(radius) >= 10 && Number(radius) <= 2000)) {
    ctx.addIssue({ code: "custom", path: ["selfOrderRadiusM"], message: "Jarak harus antara 10 dan 2000 meter" })
  }
})

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>
