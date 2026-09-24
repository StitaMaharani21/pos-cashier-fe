import type { components } from "@/shared/api/generated/owner-schema"

// Cash reconciliation for the currently active shift — owner dashboard
// "Aktual Cash Laci" widget. See pos-kasir-be's
// internal/transaction/shift/dto/shift_dto.go.
export type CashSummary = components["schemas"]["dto.CashSummaryResponse"]
export type RecordCashCountPayload =
  components["schemas"]["dto.RecordCashCountRequest"]
export type CashCount = components["schemas"]["dto.CashCountResponse"]
