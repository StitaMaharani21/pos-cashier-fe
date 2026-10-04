import type { Device, GeneratePairingCodePayload, PairingCode } from "@/entities/device/model/device.types"
import { ApiError, apiClient } from "@/shared/api/client"
import { CrudServiceError, type SingleResponse } from "@/shared/api/crud/types"

// pos-kasir-be internal/central/device — owner-only (JWT owner):
// POST /devices/pairing-code, GET /devices, PATCH /devices/:id/revoke.
// POST /devices/claim is called by the cashier app after scanning the QR.

export const DEVICES_KEY = ["devices"]

function toServiceError(error: unknown): CrudServiceError {
  if (error instanceof ApiError) return new CrudServiceError(error.code, error.message)
  return new CrudServiceError("UNKNOWN", error instanceof Error ? error.message : "Unexpected error")
}

// Throws (the section shows its error state). Newest first.
export async function listDevices(): Promise<Device[]> {
  const response = await apiClient.get<SingleResponse<Device[]>>("/devices")
  return response.data.data ?? []
}

// A new PENDING device + a 10-minute pairing token for the QR.
export async function generatePairingCode(name: string): Promise<PairingCode> {
  try {
    const response = await apiClient.post<SingleResponse<PairingCode>>("/devices/pairing-code", {
      name: name.trim(),
    } satisfies GeneratePairingCodePayload)
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
