import type {
  CreateTablePayload,
  Table,
  TableSession,
  UpdateTablePayload,
} from "@/entities/table/model/table.types"
import { apiClient } from "@/shared/api/client"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import type { SingleResponse } from "@/shared/api/crud/types"

export const tableService = createCrudService<Table, CreateTablePayload, UpdateTablePayload>("/master/tables")

// Opens (or returns the table's still-active) QR session. Its qr_token is what
// the printed/shown QR carries; the backend keeps it valid for 4 hours.
export async function openTableSession(tableId: number): Promise<TableSession> {
  const response = await apiClient.post<SingleResponse<TableSession>>(`/master/tables/${tableId}/sessions`)
  return response.data.data
}
