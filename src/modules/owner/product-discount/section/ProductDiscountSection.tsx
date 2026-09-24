import type {
  CreateProductDiscountPayload,
  ProductDiscount,
  UpdateProductDiscountPayload,
} from "@/entities/product-discount/model/product-discount.types"
import { productDiscountColumns } from "@/modules/owner/product-discount/columns/product-discount.columns"
import { ProductDiscountForm } from "@/modules/owner/product-discount/components/ProductDiscountForm"
import { createCrudService } from "@/shared/api/crud/createCrudService"
import { CrudSection } from "@/shared/ui/crud/CrudSection"

const productDiscountService = createCrudService<
  ProductDiscount,
  CreateProductDiscountPayload,
  UpdateProductDiscountPayload
>("/master/discounts/product-discounts")

export function ProductDiscountSection() {
  return (
    <CrudSection
      title="Diskon Otomatis"
      queryKey="product-discounts"
      service={productDiscountService}
      module="discount"
      listParams={{ page: 1, per_page: 100 }}
      columns={productDiscountColumns}
      getRowId={(row) => row.id ?? 0}
      emptyMessage="Belum ada diskon otomatis."
      renderForm={({ row, isSubmitting, onSubmit }) => (
        <ProductDiscountForm row={row} isSubmitting={isSubmitting} onSubmit={onSubmit} />
      )}
    />
  )
}
