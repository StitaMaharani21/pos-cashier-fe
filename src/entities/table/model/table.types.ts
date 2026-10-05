import type { components } from "@/shared/api/generated/owner-schema"

export type Table = components["schemas"]["dto.TableResponse"]
export type CreateTablePayload = components["schemas"]["dto.CreateTableRequest"]
export type UpdateTablePayload = components["schemas"]["dto.UpdateTableRequest"]

// POST /master/tables/{id}/sessions — not in the generated schema (the
// generator leaves guest-ordering endpoints out), so written by hand to match
// pos-kasir-be's dto.TableSessionResponse.
export interface TableSession {
  id: number
  table_id: number
  qr_token: string
  status: string
  expired_at: string
}
