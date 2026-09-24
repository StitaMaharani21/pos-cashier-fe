import type { components } from "@/shared/api/generated/owner-schema"

// GET/PUT /me/profile and PUT /me/password — always the logged-in user's own
// account (pos-kasir-be reads the user id from the JWT, never from the body).
export type Profile = components["schemas"]["dto.UserResponse"]
// Name + phone only: email is deliberately not editable (it's the owner's
// login key in the backend's central store registry).
export type UpdateProfilePayload = components["schemas"]["dto.UpdateProfileRequest"]
export type ChangePasswordPayload = components["schemas"]["dto.ChangePasswordRequest"]
