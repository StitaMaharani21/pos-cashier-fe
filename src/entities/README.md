# entities

Domain models shared by both `modules/owner` and `modules/public` — e.g. `product`, `promotion`, `order`, `user`. Each entity folder holds:

- `model/` — types, zod schemas, mappers
- `api/` — shared repository functions (typically the read endpoints both sides reuse; write endpoints that only one side needs stay in that module's own `infrastructure/`)

`entities/` may depend on `shared/` only — never on `modules/*`. This is what lets owner and public code share a data shape without importing each other.
