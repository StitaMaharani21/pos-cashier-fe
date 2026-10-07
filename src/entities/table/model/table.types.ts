import type { components } from "@/shared/api/generated/owner-schema"

export type Table = components["schemas"]["dto.TableResponse"] & {
  // The table's permanent QR code, once it has been created (added after the
  // generated schema; absent until GET /master/tables/:id/qr is first called).
  qr_code?: string
}
export type CreateTablePayload = components["schemas"]["dto.CreateTableRequest"]
export type UpdateTablePayload = components["schemas"]["dto.UpdateTableRequest"]

// GET /master/tables/{id}/qr and POST /master/tables/{id}/qr/rotate — the
// table's permanent QR code. Not in the generated schema (the generator leaves
// guest-ordering endpoints out), so written by hand to match pos-kasir-be's
// dto.TableQRResponse. The customer link is built from it with
// buildSelfOrderUrl().
export interface TableQR {
  table_id: number
  number: string
  qr_code: string
}
