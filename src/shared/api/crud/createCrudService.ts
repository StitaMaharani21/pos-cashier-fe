import { isAxiosError } from "axios"

import { ApiError, apiClient } from "@/shared/api/client"
import {
  CrudServiceError,
  type CrudService,
  type UpdateStatusPayload,
  type PaginatedResponse,
  type SingleResponse,
} from "@/shared/api/crud/types"
import { friendlyErrorMessage } from "@/shared/api/error-message"

// Generic CRUD factory for the plain-JSON master-data endpoints
// (menu-categories, payment-methods, tables — anything that isn't
// multipart/form-data like menu, or a GET+PUT singleton like
// business-settings). Mirrors oasis-college-web's
// `lib/crud/createCrudService.ts` contract so every consumer (CrudSection,
// useCrudForm) stays agnostic to what's behind it.
export function createCrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>>(
  resourcePath: string
): CrudService<T, TCreate, TUpdate> {
  return {
    async list(params) {
      try {
        const response = await apiClient.get<PaginatedResponse<T>>(resourcePath, {
          params,
        })
        return response.data.data
      } catch (error) {
        console.error(`Failed to list ${resourcePath}`, error)
        return []
      }
    },

    async create(payload) {
      try {
        const response = await apiClient.post<SingleResponse<T>>(
          resourcePath,
          payload
        )
        return response.data.data
      } catch (error) {
        throw toCrudServiceError(error)
      }
    },

    async update(id, payload) {
      try {
        const response = await apiClient.put<SingleResponse<T>>(
          `${resourcePath}/${id}`,
          payload
        )
        return response.data.data
      } catch (error) {
        throw toCrudServiceError(error)
      }
    },

    async setStatus(id, status) {
      try {
        const payload: UpdateStatusPayload = { status }
        const response = await apiClient.patch<SingleResponse<T>>(
          `${resourcePath}/${id}/status`,
          payload
        )
        return response.data.data
      } catch (error) {
        throw toCrudServiceError(error)
      }
    },
  }
}

function toCrudServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) {
    return new CrudServiceError(error.code, friendlyErrorMessage(error))
  }
  // The client interceptor already opened the upsell modal for this one.
  if (isAxiosError(error) && error.response?.status === 402) {
    return new CrudServiceError("FEATURE_NOT_IN_PLAN", "Fitur ini belum aktif di paket toko Anda.")
  }
  return new CrudServiceError(
    "UNKNOWN",
    friendlyErrorMessage(error)
  )
}
