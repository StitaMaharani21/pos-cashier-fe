#!/usr/bin/env node
// Generates TypeScript types for pos-kasir-be's API, scoped to only the
// owner-accessible / master-data endpoints this web app actually calls
// (guest ordering, cart, order, refund, shift, and menu-addons stay out —
// cashier flows live in a separate mobile app).
//
// pos-kasir-be's docs/swagger.json is Swagger 2.0 (swaggo's default
// output), but openapi-typescript 7.x only understands OpenAPI 3.0/3.1 —
// so this converts with swagger2openapi first.
//
// Usage: npm run types:generate
// Set POS_KASIR_BE_PATH if pos-kasir-be isn't checked out at ../pos-kasir-be
// relative to this repo.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import openapiTS, { astToString } from "openapi-typescript"
import { convertObj } from "swagger2openapi"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, "..")

const backendPath = process.env.POS_KASIR_BE_PATH
  ? resolve(process.cwd(), process.env.POS_KASIR_BE_PATH)
  : resolve(repoRoot, "..", "pos-kasir-be")

const swaggerPath = resolve(backendPath, "docs", "swagger.json")

const ALLOWED_PATH_PREFIXES = [
  "/auth/login/password",
  "/auth/users/cashier",
  // Self-service profile + password of whoever is logged in (not /me/capabilities
  // — see shared/access/types.ts for why that one stays hand-written).
  "/me/profile",
  "/me/password",
  "/master/menus",
  "/master/menu-categories",
  "/master/payment-methods",
  "/master/tables",
  "/master/business-settings",
  "/master/order-types",
  "/master/ingredients",
  "/master/recipes",
  "/master/discounts",
  // Owner dashboard analytics widgets — deliberately narrow (exact paths,
  // not broad "/orders"/"/refunds"/"/shifts" prefixes) so this app's types
  // stay scoped to read-only dashboard data, not the cart/checkout/status
  // flows those prefixes would otherwise pull in (those belong to the
  // separate cashier mobile app).
  "/orders/daily-transaction-limit",
  "/orders/dashboard-summary",
  "/orders/financial-report",
  "/orders/order-composition",
  "/orders/payment-method-value-breakdown",
  "/orders/popular-menu",
  "/orders/sales-trend",
  "/refunds/summary-today",
  "/shifts/cash-summary",
  "/shifts/{id}/cash-counts",
]

// Sub-paths that match one of the prefixes above but belong to a flow this
// app doesn't own — excluded even though they're technically owner-accessible.
const EXCLUDED_PATHS = [
  // Opening a QR guest session is part of the guest ordering flow, not the
  // owner Table CRUD screen (see pos-kasir-be's owner-dashboard-and-master-crud.md).
  "/master/tables/{id}/sessions",
]

function isAllowed(path) {
  // /guest/menus starts with "/master/menus"-adjacent but is a distinct,
  // unauthenticated prefix — explicitly excluded even though it's menu data.
  if (path.startsWith("/guest/")) return false
  if (EXCLUDED_PATHS.includes(path)) return false
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))
}

let swagger2Spec
try {
  swagger2Spec = JSON.parse(readFileSync(swaggerPath, "utf-8"))
} catch (error) {
  console.error(`Could not read ${swaggerPath}.`)
  console.error(
    "Set POS_KASIR_BE_PATH if pos-kasir-be isn't checked out at ../pos-kasir-be."
  )
  throw error
}

const allowedPaths = Object.keys(swagger2Spec.paths ?? {}).filter(isAllowed)
swagger2Spec.paths = Object.fromEntries(
  Object.entries(swagger2Spec.paths ?? {}).filter(([path]) => isAllowed(path))
)

// `paths` is filtered above, but `definitions` isn't reachable-pruned by
// swagger2openapi/openapi-typescript on its own — without this, the
// generated file would still contain every DTO in the whole API (cart,
// order, refund, discount, ...) even though only their *paths* were
// dropped. Walk $refs from the kept paths to find only the definitions
// they actually (transitively) use, matching the user's "owner/master-data
// only" scoping intent, not just "owner/master-data paths only".
function findRefs(node, found) {
  if (Array.isArray(node)) {
    for (const item of node) findRefs(item, found)
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "$ref" && typeof value === "string") {
        const match = value.match(/^#\/definitions\/(.+)$/)
        if (match) found.add(match[1])
      } else {
        findRefs(value, found)
      }
    }
  }
}

const usedDefinitions = new Set()
findRefs(swagger2Spec.paths, usedDefinitions)
// Transitive closure: a kept DTO can itself reference other DTOs.
let frontier = [...usedDefinitions]
while (frontier.length > 0) {
  const next = []
  for (const name of frontier) {
    const nested = new Set()
    findRefs(swagger2Spec.definitions?.[name], nested)
    for (const n of nested) {
      if (!usedDefinitions.has(n)) {
        usedDefinitions.add(n)
        next.push(n)
      }
    }
  }
  frontier = next
}

swagger2Spec.definitions = Object.fromEntries(
  Object.entries(swagger2Spec.definitions ?? {}).filter(([name]) =>
    usedDefinitions.has(name)
  )
)

const { openapi: openapi3Spec } = await convertObj(swagger2Spec, {})

const ast = await openapiTS(openapi3Spec)
const output = astToString(ast)

const outPath = resolve(repoRoot, "src/shared/api/generated/owner-schema.d.ts")
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(
  outPath,
  `// Generated by \`npm run types:generate\` — do not edit by hand.\n` +
    `// Source: ${swaggerPath}\n` +
    `// Filtered to owner-accessible/master-data paths only — see\n` +
    `// ALLOWED_PATH_PREFIXES in scripts/generate-owner-types.mjs.\n\n${output}`
)

console.log(`Wrote ${outPath} (${allowedPaths.length} paths):`)
for (const path of allowedPaths) console.log(`  ${path}`)
