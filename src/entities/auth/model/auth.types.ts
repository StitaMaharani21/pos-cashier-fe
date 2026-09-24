import type { components } from "@/shared/api/generated/owner-schema"

// Request body IS generated (swaggo captures it from the handler's binding
// struct); the success response isn't — the `POST /auth/login/password`
// swagger annotation doesn't reference a typed schema for its 200, so it
// comes through the generator as `{[key: string]: unknown}`. Hand-transcribed
// here from pos-kasir-be's dto.LoginResponse (internal/auth/dto/auth_dto.go)
// instead — keep this in sync if that struct changes.
export type LoginRequest = components["schemas"]["dto.LoginPasswordRequest"]

export interface LoginResponse {
  token: string
  name: string
  role: "owner" | "cashier"
  expires_at: number
  // The tenant DB this login resolved to — from X-Store-Code if it was
  // sent, or from the submitted email otherwise (see cmd/main.go's outer
  // dispatcher). Stored and replayed as X-Store-Code on every later
  // request (see shared/api/client.ts).
  store_code: string
}
