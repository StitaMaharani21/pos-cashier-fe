import { TicketIcon } from "lucide-react"

import type {
  CreateVoucherPayload,
  UpdateVoucherPayload,
  Voucher,
} from "@/entities/voucher/model/voucher.types"
import { voucherColumns } from "@/modules/owner/voucher/columns/voucher.columns"
import { VoucherForm } from "@/modules/owner/voucher/components/VoucherForm"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudSection } from "@/shared/ui/crud/CrudSection"

const voucherService = createCrudService<Voucher, CreateVoucherPayload, UpdateVoucherPayload>(
  "/master/discounts/vouchers"
)

export function VoucherSection() {
  return (
    <CrudSection
      title="Voucher"
      queryKey="vouchers"
      service={voucherService}
      module="discount"
      listParams={{ page: 1, per_page: 100 }}
      columns={voucherColumns}
      getRowId={(row) => row.id ?? 0}
      getRowLabel={(row) => row.name ?? "voucher"}
      describeCount={(total) => `${total} voucher terdaftar`}
      searchText={(row) => `${row.name ?? ""} ${row.code ?? ""}`}
      searchPlaceholder="Cari nama atau kode voucher..."
      statusOf={(row) => row.status}
      empty={{
        icon: TicketIcon,
        title: "Belum ada voucher",
        hint: "Buat kode diskon yang bisa dimasukkan kasir saat transaksi.",
      }}
      presentation="sheet"
      describeForm={(row) =>
        row ? "Perbarui kode voucher diskon" : "Kode diskon yang dimasukkan kasir untuk memotong total belanja"
      }
      renderForm={(args) => <VoucherForm {...args} />}
    />
  )
}
