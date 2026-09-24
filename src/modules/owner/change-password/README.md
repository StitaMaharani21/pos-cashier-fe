# modules/owner/change-password

Change the logged-in owner's own password — its own page (`/app/change-password`), opened from the header avatar menu rather than the sidebar or the Profile page. Backed by `pos-kasir-be`'s `PUT /me/password` (`internal/auth`): `current_password` + `new_password` (≥8), always the caller's own account (user id from the JWT).

Errors: `400 INVALID_CURRENT_PASSWORD` (deliberately not 401, which would trip the api client's auto-logout), `400 SAME_PASSWORD`, `403 PASSWORD_NOT_SET` (PIN-only cashier accounts — can't reach this owner-only app anyway). The form maps the first two onto their fields. Already-issued JWTs stay valid until they expire (stateless auth).

This is **not** a "forgot password" (reset by email) flow — the backend has no email/reset-token support; this requires knowing the current password.

Sublayers: `api/`, `schemas/` (zod), `components/` (`ChangePasswordForm` — owns its mutation so it can map error codes onto fields), `section/` (`ChangePasswordSection.tsx`).
