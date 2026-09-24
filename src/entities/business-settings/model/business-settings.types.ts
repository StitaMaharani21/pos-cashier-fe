import type { components } from "@/shared/api/generated/owner-schema"

// Singleton — GET/PUT only, no create/delete/list, so there's no separate
// "Create" payload type here.
export type BusinessSettings = components["schemas"]["dto.BusinessSettingResponse"]

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
}
