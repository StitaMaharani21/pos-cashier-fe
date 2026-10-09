import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ArmchairIcon, PrinterIcon, QrCodeIcon } from "lucide-react"
import { toast } from "sonner"

import type { CreateTablePayload, Table, UpdateTablePayload } from "@/entities/table/model/table.types"
import { getBusinessSettings } from "@/modules/owner/business-settings/api/business-settings.service"
import { getTableQR, tableService } from "@/modules/owner/table/api/table.service"
import { tableColumns } from "@/modules/owner/table/columns/table.columns"
import { TableForm } from "@/modules/owner/table/components/TableForm"
import { TableQrDialog } from "@/modules/owner/table/components/TableQrDialog"
import { openPrintWindow, printInto, type QrCard } from "@/modules/owner/table/lib/print-qr"
import { useAuthStore } from "@/shared/auth/store"
import { buildSelfOrderUrl } from "@/shared/lib/self-order-url"
import { Button } from "@/shared/ui/button"
import { CrudSection } from "@/shared/ui/crud/CrudSection"
import { RowActionButton } from "@/shared/ui/row-actions"

// Tables for QR self-order: plain CRUD plus a "QR" row action (the table's
// permanent QR, printed once and left on the table) and "Cetak semua QR".
export function TableSection() {
  const [qrTable, setQrTable] = useState<Table | null>(null)
  const storeCode = useAuthStore((state) => state.store_code) ?? ""

  // Only for the printed card's heading; the page works without it.
  const { data: settings } = useQuery({
    queryKey: ["business-settings"],
    queryFn: getBusinessSettings,
    staleTime: 5 * 60_000,
    retry: false,
  })
  const storeName = settings?.business_name ?? ""

  // Every active table gets its QR (created on the spot for tables that never
  // had one) and all of them go to one print job, a card per page.
  const printAll = useMutation({
    mutationFn: async (): Promise<QrCard[]> => {
      const tables = await tableService.list({ page: 1, per_page: 100 })
      const active = tables.filter((table) => (table.status ?? "").toLowerCase() !== "inactive")
      return Promise.all(
        active.map(async (table) => {
          const code = table.qr_code || (await getTableQR(table.id as number)).qr_code
          return { number: table.number ?? "", url: buildSelfOrderUrl(storeCode, code) }
        })
      )
    },
  })

  function handlePrintAll() {
    // The window has to open inside the click, before the data is loaded.
    const win = openPrintWindow()
    if (!win) {
      toast.error("Jendela cetak diblokir peramban. Izinkan pop-up lalu coba lagi.")
      return
    }
    printAll.mutate(undefined, {
      onSuccess: (cards) => {
        if (cards.length === 0) {
          win.close()
          toast.info("Belum ada meja aktif untuk dicetak")
          return
        }
        printInto(win, cards, storeName)
      },
      onError: () => {
        win.close()
        toast.error("Gagal menyiapkan QR meja")
      },
    })
  }

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
        hint: "Tambahkan meja, lalu cetak QR-nya sekali dan taruh di meja agar pelanggan bisa memesan dari HP.",
      }}
      describeForm={(row) => (row ? "Perbarui data meja" : "Meja yang bisa dipakai pelanggan untuk memesan lewat QR")}
      toolbarActions={
        <Button variant="outline" className="h-10" disabled={printAll.isPending} onClick={handlePrintAll}>
          <PrinterIcon />
          {printAll.isPending ? "Menyiapkan..." : "Cetak semua QR"}
        </Button>
      }
      extraRowActions={(row) => (
        <RowActionButton icon={QrCodeIcon} label={`QR Meja ${row.number}`} onClick={() => setQrTable(row)} />
      )}
      renderForm={(args) => <TableForm {...args} />}
    >
      <TableQrDialog table={qrTable} storeName={storeName} onOpenChange={(open) => !open && setQrTable(null)} />
    </CrudSection>
  )
}
