import type { components } from "@/shared/api/generated/owner-schema"

// The 3 canonical order types (dine_in/takeaway/delivery) are a fixed set
// auto-seeded by the backend — no create/delete, only enabled/sort_order
// are editable (see pos-kasir-be's internal/master/order_type).
export type OrderType = components["schemas"]["dto.OrderTypeResponse"]
export type UpdateOrderTypePayload = components["schemas"]["dto.UpdateOrderTypeRequest"]
