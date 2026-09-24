import type { components } from "@/shared/api/generated/owner-schema"

// Request bodies ARE generated (swaggo captures them from the handlers'
// binding structs); the success responses aren't — GET /auth/users/cashier,
// GET /auth/users/cashier/limit, and POST /auth/users/cashier's handlers
// annotate their 200/201 as `map[string]interface{}`, so they come through
// the generator as untyped objects. Hand-transcribed below from
// pos-kasir-be's dto.UserResponse/dto.CashierLimitStatusResponse
// (internal/auth/dto/auth_dto.go) instead — keep these in sync if those
// structs change.
export type CreateCashierPayload = components["schemas"]["dto.CreateCashierRequest"]
export type UpdateCashierStatusPayload =
  components["schemas"]["dto.UpdateCashierStatusRequest"]

export interface Cashier {
  id: number
  name: string
  username: string
  phone_no: string
  role: "owner" | "cashier"
  status: "active" | "inactive"
  created_at: string
}

export interface CashierLimitStatus {
  plan: string
  used: number
  limit: number
}
