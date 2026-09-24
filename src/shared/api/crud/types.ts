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
}

export interface CrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  // Never throws — logs and returns [] on failure, matching oasis's contract
  // (list failures degrade to an empty state, not a thrown error).
  list: (params?: Record<string, unknown>) => Promise<T[]>
  create: (payload: TCreate) => Promise<T>
  update: (id: number | string, payload: TUpdate) => Promise<T>
  remove: (id: number | string) => Promise<void>
}
