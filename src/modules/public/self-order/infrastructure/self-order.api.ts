import type {
  AddCartItemPayload,
  CheckoutPayload,
  GuestCart,
  GuestMenu,
  GuestOrder,
  GuestSession,
  UpdateCartItemPayload,
} from "@/modules/public/self-order/domain/self-order.types"
import { createGuestClient, type GuestContext } from "@/modules/public/self-order/infrastructure/guest-client"
import type { PaginatedResponse, SingleResponse } from "@/shared/api/crud/types"

// pos-kasir-be answers these with the DTO directly under `data`, except the
// paginated menu list (see response.Success / SuccessPaginated).

export async function resolveSession(storeCode: string, qrToken: string): Promise<GuestSession> {
  const response = await createGuestClient({ storeCode }).post<SingleResponse<GuestSession>>(
    "/guest/sessions/resolve",
    { qr_token: qrToken }
  )
  return response.data.data
}

const MENU_PAGE_SIZE = 100

// The list endpoint requires page + per_page; a menu is read whole (category
// chips and search are client-side), so walk every page.
export async function listMenus(storeCode: string): Promise<GuestMenu[]> {
  const client = createGuestClient({ storeCode })
  const menus: GuestMenu[] = []
  let page = 1
  let totalPages = 1
  do {
    const response = await client.get<PaginatedResponse<GuestMenu>>("/guest/menus", {
      params: { page, per_page: MENU_PAGE_SIZE },
    })
    menus.push(...response.data.data)
    totalPages = response.data.total_pages
    page += 1
  } while (page <= totalPages)
  return menus
}

export async function getCart(ctx: GuestContext, cartId: number): Promise<GuestCart> {
  const response = await createGuestClient(ctx).get<SingleResponse<GuestCart>>(`/guest/carts/${cartId}`)
  return response.data.data
}

export async function addCartItem(ctx: GuestContext, cartId: number, payload: AddCartItemPayload): Promise<void> {
  await createGuestClient(ctx).post(`/guest/carts/${cartId}/items`, payload)
}

export async function updateCartItem(
  ctx: GuestContext,
  cartId: number,
  itemId: number,
  payload: UpdateCartItemPayload
): Promise<void> {
  await createGuestClient(ctx).put(`/guest/carts/${cartId}/items/${itemId}`, payload)
}

export async function removeCartItem(ctx: GuestContext, cartId: number, itemId: number): Promise<void> {
  await createGuestClient(ctx).delete(`/guest/carts/${cartId}/items/${itemId}`)
}

export async function checkoutCart(ctx: GuestContext, cartId: number, payload: CheckoutPayload): Promise<GuestOrder> {
  const response = await createGuestClient(ctx).post<SingleResponse<GuestOrder>>(
    `/guest/carts/${cartId}/checkout`,
    payload
  )
  return response.data.data
}

export async function getOrder(ctx: GuestContext, orderId: number): Promise<GuestOrder> {
  const response = await createGuestClient(ctx).get<SingleResponse<GuestOrder>>(`/guest/orders/${orderId}`)
  return response.data.data
}
