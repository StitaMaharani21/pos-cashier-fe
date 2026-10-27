import type { components } from "@/shared/api/generated/owner-schema"

// Cash reconciliation for the currently active shift — owner dashboard
// "Aktual Cash Laci" widget. See pos-kasir-be's
// internal/transaction/shift/dto/shift_dto.go.
//
// The generated schema predates the live drawer breakdown (swag now emits this
// DTO under a package-qualified name, so `types:generate` can't be re-run
// without losing other schemas) — those fields are declared here by hand.
export type CashSummary = components["schemas"]["dto.CashSummaryResponse"] & {
  opening_balance?: number
  cash_sales?: number
  cash_in?: number
  cash_out?: number
  cash_refund?: number
  // Opening + cash sales + cash in - cash out - cash refund, computed live.
  // `expected_amount` can be the snapshot taken at the last cash count.
  current_expected_amount?: number
}
export type RecordCashCountPayload =
  components["schemas"]["dto.RecordCashCountRequest"]
export type CashCount = components["schemas"]["dto.CashCountResponse"]

// PATCH /shifts/:id/close (hand-written: not in the generated schema).
export interface CloseShiftPayload {
  closing_balance: number
  // Explanation of a cash difference; the form requires it when difference != 0.
  closing_notes?: string
}

// POST /shifts/{id}/cash-transactions — a cash movement outside a sale.
export interface RecordCashMovementPayload {
  // in = Kas Masuk (raises the expected cash), out = Kas Keluar (lowers it).
  type: "in" | "out"
  amount: number
  description: string
}

export type CashDifferenceStatus = "balanced" | "surplus" | "shortage"

export interface ClosedShift {
  id: number
  opening_balance: number
  closing_balance: number
  expected_balance?: number
  difference?: number
  difference_status?: CashDifferenceStatus
  closing_notes?: string
  cash_sales?: number
  cash_in?: number
  cash_out?: number
  cash_refund?: number
}
