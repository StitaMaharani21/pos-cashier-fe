import type { components } from "@/shared/api/generated/owner-schema"

// Singleton — GET/PUT only, no create/delete/list, so there's no separate
// "Create" payload type here.
export type BusinessSettings = components["schemas"]["dto.BusinessSettingResponse"] & {
  // The cafe's location for the "di luar radius" flag on QR-table orders
  // (added after the generated schema; null = not set yet). The radius always
  // holds the effective value (100 m until the owner changes it).
  latitude?: number | null
  longitude?: number | null
  self_order_radius_m?: number
}

// PUT /master/business-settings is multipart/form-data with each field
// declared as an inline swaggo `formData` param (for the logo upload), so
// swagger emits no request-body schema to generate from — hand-written here,
// mirroring pos-kasir-be's dto.UpdateBusinessSettingFormRequest. Omitting
// `logo` keeps the current one server-side.
export interface UpdateBusinessSettingsPayload {
  business_name: string
  address: string
  phone_no: string
  email: string
  tax_percentage: number
  receipt_footer: string
  logo?: File | null
  // Optional: omitted = the backend keeps the saved location (so the logo
  // upload, which resends the other fields, never clears it).
  latitude?: number
  longitude?: number
  self_order_radius_m?: number
}
