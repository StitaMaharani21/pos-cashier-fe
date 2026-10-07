import type { Device, GeneratePairingCodePayload, PairingCode } from "@/entities/device/model/device.types"
import type { DeviceQuota } from "@/entities/subscription/model/subscription.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type SingleResponse } from "@/shared/api/crud/types"

// pos-kasir-be internal/central/device — owner-only (JWT owner):
// POST /devices/pairing-code, GET /devices, PATCH /devices/:id/revoke.
// POST /devices/claim is called by the cashier app after scanning the QR.

export const DEVICES_KEY = ["devices"]
// A sibling of DEVICES_KEY, so invalidating ["devices"] refreshes it too.
export const DEVICE_QUOTA_KEY = ["devices", "quota"]

// The backend refuses a new pairing once the plan's device allowance (plus any
// Device Tambahan add-on) is used up.
export const DEVICE_LIMIT_MESSAGE =
  "Kuota perangkat penuh. Beli device tambahan di Paket & Addon, atau cabut perangkat yang tidak dipakai."

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) {
    if (error.code === "DEVICE_LIMIT_REACHED") return new CrudServiceError(error.code, DEVICE_LIMIT_MESSAGE)
    return new CrudServiceError(error.code, error.message)
  }
  return new CrudServiceError("UNKNOWN", error instanceof Error ? error.message : "Unexpected error")
}

// Throws (the section shows its error state). Newest first.
export async function listDevices(): Promise<Device[]> {
  const response = await apiClient.get<SingleResponse<Device[]>>("/devices")
  return response.data.data ?? []
}

// GET /devices/quota — { limit, used, base, extra, unlimited }. Used = devices
// bound to the store; limit = the plan's allowance + active Device Tambahan.
export async function getDeviceQuota(): Promise<DeviceQuota> {
  const response = await apiClient.get<SingleResponse<DeviceQuota>>("/devices/quota")
  return response.data.data
}

// A new PENDING device + a 10-minute pairing token for the QR.
export async function generatePairingCode(name: string): Promise<PairingCode> {
  try {
    const response = await apiClient.post<SingleResponse<PairingCode>>(
      "/devices/pairing-code",
      { name: name.trim() } satisfies GeneratePairingCodePayload,
      // A full quota is a 403 the dialog explains itself (and links to the
      // billing page) — not the global "no access" toast.
      { skipForbiddenToast: true }
    )
    return response.data.data
  } catch (error) {
    throw toServiceError(error)
  }
}

// The device can no longer log a cashier in, and a session already running
// on it is cut off on its next request.
export async function revokeDevice(deviceId: string): Promise<void> {
  try {
    await apiClient.patch(`/devices/${encodeURIComponent(deviceId)}/revoke`)
  } catch (error) {
    throw toServiceError(error)
  }
}
