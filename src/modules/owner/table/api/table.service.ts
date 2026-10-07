import type { CreateTablePayload, Table, TableQR, UpdateTablePayload } from "@/entities/table/model/table.types"
import { apiClient } from "@/shared/api/client"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import type { SingleResponse } from "@/shared/api/crud/types"

export const tableService = createCrudService<Table, CreateTablePayload, UpdateTablePayload>("/master/tables")

export const TABLE_QR_KEY = ["table-qr"] as const

// The table's permanent QR code (created on first request). The printed QR
// stays valid until the owner replaces it with rotateTableQR().
export async function getTableQR(tableId: number): Promise<TableQR> {
  const response = await apiClient.get<SingleResponse<TableQR>>(`/master/tables/${tableId}/qr`)
  return response.data.data
}

// A new code; QR codes printed earlier stop working and the table's guest
// sessions are closed, so people still ordering from the old one are cut off.
export async function rotateTableQR(tableId: number): Promise<TableQR> {
  const response = await apiClient.post<SingleResponse<TableQR>>(`/master/tables/${tableId}/qr/rotate`)
  return response.data.data
}
