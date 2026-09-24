# modules/owner/profile

The logged-in user's own account. Backed by `pos-kasir-be`'s `internal/auth` self-service routes under `/me` (owner + cashier JWT, always the caller's own account — the user id comes from the token, never the body):

- `GET /me/profile` → `dto.UserResponse` (name, username, email, phone_no, role, status)
- `PUT /me/profile` — `name` (3–150) + `phone_no` (≤30) only. **Email is read-only**: it's also stored in the backend's central DB as the key the login dispatcher resolves the store from (`cmd/main.go` `resolveStoreCodeFromLoginBody`), so changing it in the tenant DB alone would lock the owner out.

Changing the password (`PUT /me/password`) is its own page — see `modules/owner/change-password`, opened from the header avatar menu.

A successful profile save/load also refreshes the header's name/email via `useAuthStore().setProfile`.

Sublayers: `api/` (hand-written service — not a CRUD resource), `schemas/` (zod, mirroring the backend bindings), `components/` (`ProfileForm`), `section/` (`ProfileSection.tsx`).
