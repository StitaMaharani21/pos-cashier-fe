import type { components } from "@/shared/api/generated/owner-schema"

export type Device = components["schemas"]["dto.DeviceResponse"]
export type PairingCode = components["schemas"]["dto.PairingCodeResponse"]
export type GeneratePairingCodePayload = components["schemas"]["dto.GeneratePairingCodeRequest"]

// devices.status in pos-kasir-be (internal/central/device/entities).
export type DeviceStatus = "PENDING" | "BOUND" | "REVOKED"
