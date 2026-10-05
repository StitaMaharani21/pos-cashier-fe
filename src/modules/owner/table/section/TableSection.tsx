import { useState } from "react"
import { ArmchairIcon, QrCodeIcon } from "lucide-react"

import type { CreateTablePayload, Table, UpdateTablePayload } from "@/entities/table/model/table.types"
import { tableService } from "@/modules/owner/table/api/table.service"
import { tableColumns } from "@/modules/owner/table/columns/table.columns"
import { TableForm } from "@/modules/owner/table/components/TableForm"
import { TableQrDialog } from "@/modules/owner/table/components/TableQrDialog"
import { CrudSection } from "@/shared/ui/crud/CrudSection"
import { RowActionButton } from "@/shared/ui/row-actions"

// Tables for QR self-order: plain CRUD plus a "QR" row action that opens the
// table's guest session and shows the QR customers scan.
export function TableSection() {
  const [qrTable, setQrTable] = useState<Table | null>(null)

  return (
    <CrudSection<Table, CreateTablePayload, UpdateTablePayload>
      title="Meja"
      queryKey="tables"
      service={tableService}
      module="table"
      listParams={{ page: 1, per_page: 100 }}
      columns={tableColumns}
      getRowId={(row) => row.id ?? 0}
      getRowLabel={(row) => `Meja ${row.number ?? ""}`}
      describeCount={(total) => `${total} meja terdaftar`}
      searchText={(row) => row.number ?? ""}
      searchPlaceholder="Cari nomor meja..."
      statusOf={(row) => row.status}
      empty={{
        icon: ArmchairIcon,
        title: "Belum ada meja",
        hint: "Tambahkan meja, lalu buat QR-nya agar customer bisa memesan dari HP.",
      }}
      describeForm={(row) => (row ? "Perbarui data meja" : "Meja yang bisa di-scan customer untuk memesan")}
      extraRowActions={(row) => (
        <RowActionButton icon={QrCodeIcon} label={`QR Meja ${row.number}`} onClick={() => setQrTable(row)} />
      )}
      renderForm={(args) => <TableForm {...args} />}
    >
      <TableQrDialog table={qrTable} onOpenChange={(open) => !open && setQrTable(null)} />
    </CrudSection>
  )
}
