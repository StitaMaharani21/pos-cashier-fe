import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  FEATURE_NOT_IN_PLAN,
  PAYMENT_GATEWAY_QUERY_KEY,
  PAYMENT_METHODS_QUERY_KEY,
  savePaymentGateway,
} from "@/modules/owner/payment-gateway/api/payment-gateway.service"
import {
  serverKeySchema,
  type ServerKeyFormValues,
} from "@/modules/owner/payment-gateway/schemas/payment-gateway.schema"
import { CrudServiceError } from "@/shared/api/crud/types"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { friendlyErrorMessage } from "@/shared/api/error-message"

// Owns its own mutation (like ChangePasswordForm) because INVALID_SERVER_KEY
// maps onto the field while the other failures are toasts.
export function ServerKeyForm({ connected }: { connected: boolean }) {
  const queryClient = useQueryClient()
  const form = useCrudForm({
    schema: serverKeySchema,
    defaultValues: { serverKey: "" },
  })

  const mutation = useMutation({
    mutationFn: savePaymentGateway,
    onSuccess: () => {
      toast.success(
        connected
          ? "Kunci rahasia Midtrans berhasil diperbarui"
          : "Midtrans berhasil terhubung. Metode \"QRIS Midtrans\" kini aktif untuk pelanggan."
      )
      // The save also creates/enables the managed "QRIS Midtrans" method.
      queryClient.invalidateQueries({ queryKey: PAYMENT_GATEWAY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY })
      form.reset()
    },
    onError: (error) => {
      if (!(error instanceof CrudServiceError)) {
        toast.error("Gagal menyimpan kunci rahasia Midtrans")
        return
      }
      switch (error.code) {
        // Upsell modal is already open (api client interceptor).
        case FEATURE_NOT_IN_PLAN:
          return
        // The backend's message is English; this one tells the owner what to check.
        case "INVALID_SERVER_KEY":
          form.setError("serverKey", {
            message:
              "Kunci rahasia ditolak Midtrans. Pastikan kuncinya benar dan sesuai mode akun Anda (uji coba atau asli).",
          })
          return
        case "PAYMENT_PROVIDER_UNAVAILABLE":
          toast.error("Midtrans sedang tidak bisa dihubungi. Coba lagi sebentar lagi.")
          return
        case "PAYMENT_PROVIDER_NOT_CONFIGURED":
          toast.error(
            "Pembayaran online belum siap dipakai. Hubungi tim Neela untuk bantuan."
          )
          return
        default:
          toast.error(friendlyErrorMessage(error))
      }
    },
  })

  function handleSubmit(values: ServerKeyFormValues) {
    mutation.mutate({ server_key: values.serverKey })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5">
        <div>
          <h2 className="text-base font-extrabold text-foreground">
            {connected ? "Ganti Kunci Rahasia" : "Hubungkan Akun Midtrans"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Pembayaran QRIS pelanggan akan masuk langsung ke akun Midtrans toko Anda.
          </p>
        </div>

        <FormField
          control={form.control}
          name="serverKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kunci Rahasia Midtrans (Server Key)</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Mid-server-xxxxxxxxxxxx"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Cari di dashboard Midtrans: menu Settings → Access Keys, lalu salin bagian Server Key.
                Kunci disimpan dengan aman dan tidak akan ditampilkan lagi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending} className="self-start">
          {mutation.isPending
            ? "Memverifikasi..."
            : connected
              ? "Simpan Kunci Baru"
              : "Simpan & Hubungkan"}
        </Button>
      </form>
    </Form>
  )
}
