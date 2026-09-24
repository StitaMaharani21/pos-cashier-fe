import type { components } from "@/shared/api/generated/owner-schema"

// Owner dashboard "Total Refund" widget — today's refunds only, no
// comparison vs. yesterday. See pos-kasir-be's
// internal/transaction/refund/dto/refund_dto.go.
export type RefundSummaryToday = components["schemas"]["dto.RefundSummaryResponse"]
