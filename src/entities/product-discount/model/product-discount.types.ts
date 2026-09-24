import type { components } from "@/shared/api/generated/owner-schema"

export type ProductDiscount = components["schemas"]["dto.ProductDiscountResponse"]
export type ProductDiscountMenu = components["schemas"]["dto.ProductDiscountMenuResponse"]
export type CreateProductDiscountPayload =
  components["schemas"]["dto.CreateProductDiscountRequest"]
export type UpdateProductDiscountPayload =
  components["schemas"]["dto.UpdateProductDiscountRequest"]
