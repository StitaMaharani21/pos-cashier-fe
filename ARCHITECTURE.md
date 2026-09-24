# Architecture

This app has two audiences sharing one codebase:

- **Owner** — authenticated web console for the store owner: menu/menu-category/payment-method/table/business-settings master data, plus a dashboard. Talks directly to `pos-kasir-be` (a Go REST API) via axios — no Supabase, no BaaS. Cashier (role `cashier`) is a **separate mobile app**, not part of this web FE.
- **Public visitor** — unauthenticated marketing surface (landing/promotions). Still frontend-content-driven for now; `pos-kasir-be` has no promotion/CMS backend yet.

The folder structure keeps those two cleanly separated while sharing what they legitimately share (design system, domain models, API client), following clean-architecture layering.

## Layers and the dependency rule

```
src/
├── app/        # bootstrap: providers, router, layouts
├── modules/
│   ├── owner/   # authenticated console — one folder per feature
│   └── public/  # unauthenticated marketing surface — one folder per feature
├── entities/   # domain models shared across modules (Menu, MenuCategory, PaymentMethod, Table, BusinessSettings, Auth, ...)
├── shared/     # framework/infra kernel: ui, api, auth, config, lib, types, hooks
└── assets/
```

Dependencies only point downward:

```
app  →  modules/*  →  entities  →  shared
```

Rules:
- `shared/` depends on nothing else in `src/`.
- `entities/` may depend on `shared/` only.
- `modules/owner` and `modules/public` **never import from each other directly.** If both sides ever need the same thing, promote it to `entities/` or `shared/`.
- `app/` is the only place allowed to know about both `modules/owner` and `modules/public` at once — it's where routing picks which one to render.

## Per-feature convention — `modules/owner/*` (mirrors oasis-college-web)

Owner feature folders follow a **feature-folder pattern** deliberately mirrored from `oasis-college-web` (a working sibling project), swapping its Supabase data layer for a Go REST API:

```
menu-category/
├── components/   # form fields — presentational, RHF-bound
├── schemas/       # zod schema for the create/update form
├── columns/         # CrudColumn<T>[] — table column definitions
└── section/           # the orchestrator: wires shared/ui/crud's CrudSection
                        # to this feature's CrudService
```

The data-access seam is `shared/api/`, not a component:

```
section/*.tsx  →  createCrudService("/master/x")  →  shared/api/client.ts (axios)  →  pos-kasir-be
```

Components never call the axios client directly — only `section/*.tsx` does, through a `CrudService` from `shared/api/crud/createCrudService.ts`.

**One deliberate deviation from oasis**: oasis keeps data-access in a separate top-level `services/` folder (since it has many public *and* admin features consuming it). This app only has one module (`owner`) consuming the API so far, so the CRUD factory + axios client live under `shared/api/` instead. Revisit this if `modules/public` ever needs its own real data-access layer.

**Not every feature needs all four sublayers.** `dashboard/` has no backing endpoint yet and stays doc-only; `business-settings/` is a GET+PUT singleton (no list), so it skips `columns/` and calls the axios client directly instead of `createCrudService` (see its README). `menu/`'s create/update are `multipart/form-data` (image upload), so it also bypasses the generic JSON CRUD factory for those two calls — see `modules/owner/menu/README.md`.

Current owner features (backed by `pos-kasir-be`'s `docs/design-plans/owner-dashboard-and-master-crud.md`): `auth` (implemented), `dashboard` (implemented against hardcoded data — see below), `menu`, `menu-category`, `payment-method`, `table`, `business-settings`, `voucher`, `product-discount`.

`dashboard` is a deliberate exception to the CRUD-feature pattern above — there's no form/table to manage, just charts and stats, and no backend endpoint to back them yet (`pos-kasir-be` has no analytics endpoint at all). It's built against `dashboard.mock-data.ts`, a hardcoded dataset per period, with every component depending only on that file's exported shapes — swap its contents for a react-query hook once a real report endpoint exists, nothing else changes. `Recharts` was added as a dependency for its trend chart (the only chart in the app so far, so it's used directly rather than through a `shared/ui` chart abstraction — revisit that if a second chart shows up).

## Per-feature convention — `modules/public/*` (unchanged from Phase 1)

`modules/public/*` still uses the original `domain/application/infrastructure/presentation` sublayering from Phase 1 — it has no real backend integration yet, so there was no reason to migrate it. If/when it gets a real data source, reconsider whether it should move to the same oasis-style convention as `owner` for consistency, or stay as-is if its needs turn out different (e.g. SSR-portability constraints, see below).

## State management convention

- **Server state** (menus, categories, payment methods, tables, business settings): `@tanstack/react-query`. For owner CRUD features this is entirely inside `shared/ui/crud/CrudSection.tsx` — feature `section/*.tsx` files don't hand-write query/mutation hooks, they configure `CrudSection` with a `CrudService` and column/form definitions.
- **Auth session** (token, name, role): `zustand`, persisted to `localStorage` — `shared/auth/store.ts`. Cross-cutting (read by the axios client's request interceptor, the router's `RequireAuth` guard, and `OwnerLayout`), so it lives in `shared/`, not a feature.
- **Ephemeral UI state** (a dialog open/closed, a form's own field state): local `useState`/`react-hook-form` state inside the component that owns it — not lifted into zustand.

## Backend contract (`pos-kasir-be`)

- Base path `/api/v1`. Bearer JWT via `Authorization: Bearer <token>` header (no cookies) — this app only ever authenticates as role `owner`.
- All JSON is **snake_case** (`category_id`, `is_available`, ...) — matches Go's `json:"..."` tags directly, no camelCase conversion layer.
- List responses: `{message, data: T[], total, page, per_page, total_pages}` — pagination fields flattened at the top level, not nested. Non-list success: `{message, data: T}`.
- Errors: `{code, message}` — mapped to `ApiError`/`CrudServiceError` by `shared/api/client.ts` / `shared/api/crud/createCrudService.ts`.
- CORS: the backend's `ALLOWED_ORIGINS` env var must include this app's origin (`http://localhost:5173` in dev) — added specifically so this FE can call it directly instead of going through Supabase's built-in CORS handling.

## Type generation

`npm run types:generate` runs `scripts/generate-owner-types.mjs`, which:
1. Reads `pos-kasir-be`'s `docs/swagger.json` (path from `POS_KASIR_BE_PATH` env var, default `../pos-kasir-be`).
2. Filters it down to only the owner-accessible/master-data paths this app calls (see `ALLOWED_PATH_PREFIXES` in that script) and their transitively-referenced schemas — deliberately narrower than "the whole API," so nothing from cart/order/refund/shift/guest-ordering leaks into this app's types even though some of those are technically owner-accessible too.
3. Converts Swagger 2.0 → OpenAPI 3 (`swagger2openapi`) since `openapi-typescript` 7.x only reads OpenAPI 3.x, then generates `src/shared/api/generated/owner-schema.d.ts`.

That generated file is committed (this app must build without `pos-kasir-be` checked out) and is **not imported directly by feature code** — each `entities/<name>/model/*.types.ts` re-exports a narrowed, named subset of it (e.g. `entities/menu/model/menu.types.ts` exports `Menu`, `CreateMenuPayload`, `UpdateMenuPayload`). Re-run `npm run types:generate` whenever the backend's owner-facing DTOs change.

One gap: `POST /auth/login/password`'s success response isn't typed in the backend's swagger annotations, so `LoginResponse` in `entities/auth/model/auth.types.ts` is hand-transcribed from `pos-kasir-be`'s `dto.LoginResponse` struct instead of generated — keep it in sync manually if that struct changes.

## Rendering / SEO decision (`modules/public`)

`modules/public` is client-rendered (Vite SPA) for now. Because SEO matters for public promotion pages, it's written to stay **portable to SSR later**: no top-level `window`/`localStorage`/`document` reads during render, meta tags handled through a swappable hook. Two future options, deferred until there's a concrete SEO/traffic need:

1. **Vite SSR entry scoped to public routes** — Vite supports SSR natively; add a second server entry rendering only `modules/public/**`, `modules/owner/**` stays pure CSR behind the login wall.
2. **Extract `modules/public` into its own app** (e.g. Next.js/Astro), sharing `entities/`/`shared/ui` via a workspace if the repo becomes a monorepo.

## Routing

`app/router/AppRouter.tsx`: `/` (public landing page, `modules/public/landing` — always the landing page, even for a logged-in owner), `/daftar` (public store registration, `modules/public/store-registration` — redirects a logged-in owner to `/app`), `/login` (public) and `/app/*` (wrapped in `RequireAuth`, which checks `shared/auth`'s session and requires `role === "owner"`). Unknown paths redirect to `/`.

## File naming conventions

- Folders: `kebab-case`.
- React component files: `PascalCase.tsx`.
- Hooks: `useThing.ts`.
- Type-only files: `thing.types.ts`; validation schemas: `thing.schema.ts`.
