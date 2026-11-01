import type { ReactNode } from "react"

// Matches pos-kasir-be's response.SuccessPaginated envelope: pagination
// fields are flattened at the top level, not nested inside `data`.
export interface PaginatedResponse<T> {
  message: string
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Matches pos-kasir-be's response.Success envelope.
export interface SingleResponse<T> {
  message: string
  data: T
}

// Matches pos-kasir-be's response.Error envelope ({code, message}).
export class CrudServiceError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

export interface CrudColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  // Numbers/money "right", switches "center"; the "Aksi" column is always right.
  align?: "left" | "center" | "right"
  // Width / wrapping for both the header and the cells (e.g. "w-32", "whitespace-normal").
  className?: string
}

// Master data is never deleted, only switched off. Matches pos-kasir-be's
// masterstatus package (PATCH …/{id}/status body).
export type MasterStatus = "active" | "inactive"

export interface UpdateStatusPayload {
  status: MasterStatus
}

export interface CrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  // Never throws — logs and returns [] on failure, matching oasis's contract
  // (list failures degrade to an empty state, not a thrown error).
  list: (params?: Record<string, unknown>) => Promise<T[]>
  create: (payload: TCreate) => Promise<T>
  update: (id: number | string, payload: TUpdate) => Promise<T>
  // Activate / deactivate instead of deleting. `row` is the row being toggled,
  // for resources that have to resend it (a PUT) rather than PATCH the status.
  setStatus: (id: number | string, status: MasterStatus, row: T) => Promise<T>
}
