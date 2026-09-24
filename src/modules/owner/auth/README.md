# modules/owner/auth

Owner login — `POST /auth/login/password` (email + password). This is the only login this app offers; cashier PIN login (`/auth/login/pin`) belongs to the separate mobile app and isn't implemented here.

Fully implemented (see `schemas/login.schema.ts`, `components/LoginForm.tsx`, `section/LoginSection.tsx`) — the one feature wired end-to-end as the reference pattern for the rest of `modules/owner/*`.

Route path is `/login` (top-level, outside `/app`) even though the feature lives under `modules/owner` — route path and folder location are independent.
