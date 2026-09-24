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
      emptyMessage="Belum ada voucher."
      renderForm={({ row, isSubmitting, onSubmit }) => (
        <VoucherForm row={row} isSubmitting={isSubmitting} onSubmit={onSubmit} />
      )}
    />
  )
}
