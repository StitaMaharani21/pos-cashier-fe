import { z } from "zod"

// Mirrors pos-kasir-be's dto.SaveGatewayRequest (server_key: required, max 200)
// plus the key shape midtrans.CheckServerKeyFormat enforces. Whether it is a
// sandbox or production key is checked by the backend against its own mode,
// which the form can't know — that error comes back as INVALID_SERVER_KEY.
export const serverKeySchema = z.object({
  serverKey: z
    .string()
    .trim()
    .min(1, "Server key wajib diisi")
    .max(200, "Server key terlalu panjang")
    .regex(
      /^(SB-)?Mid-server-/,
      "Format tidak dikenali. Server key diawali Mid-server- (production) atau SB-Mid-server- (sandbox)"
    ),
})

export type ServerKeyFormValues = z.infer<typeof serverKeySchema>
