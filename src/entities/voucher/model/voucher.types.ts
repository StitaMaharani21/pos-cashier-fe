import type { components } from "@/shared/api/generated/owner-schema"

export type Voucher = components["schemas"]["dto.VoucherResponse"]
export type CreateVoucherPayload = components["schemas"]["dto.CreateVoucherRequest"]
export type UpdateVoucherPayload = components["schemas"]["dto.UpdateVoucherRequest"]
