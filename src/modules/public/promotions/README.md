# modules/public/promotions

Public, read-only promotion listing/detail pages — what visitors see when a promo is shared or searched. Has real fetching logic, so it follows the full sublayer split:

- `domain/` — display rules (e.g. active/expired filtering)
- `application/` — `usePromotionList`, `usePromotionDetail` (react-query)
- `infrastructure/` — API calls (likely reusing `entities/promotion`'s shared repository)
- `presentation/` — promo listing/detail pages

Reads the same `Promotion` entity as `modules/owner/promotions` (see `entities/`) but only the read use-cases — never imports from `modules/owner` directly.

Written to avoid CSR-only assumptions so this route can gain SSR/prerendering later — see `ARCHITECTURE.md`.
