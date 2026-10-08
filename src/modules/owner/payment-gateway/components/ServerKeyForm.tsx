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
          ? "Server key Midtrans diperbarui"
          : "Midtrans berhasil terhubung. Metode \"QRIS Midtrans\" kini aktif untuk pelanggan."
      )
      // The save also creates/enables the managed "QRIS Midtrans" method.
      queryClient.invalidateQueries({ queryKey: PAYMENT_GATEWAY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY })
      form.reset()
    },
    onError: (error) => {
      if (!(error instanceof CrudServiceError)) {
        toast.error("Gagal menyimpan server key")
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
              "Server key ditolak Midtrans. Pastikan key benar dan sesuai mode server (sandbox atau production).",
          })
          return
        case "PAYMENT_PROVIDER_UNAVAILABLE":
          toast.error("Midtrans tidak dapat dihubungi saat ini. Coba lagi sebentar lagi.")
          return
        case "PAYMENT_PROVIDER_NOT_CONFIGURED":
          toast.error(
            "Pembayaran online belum dikonfigurasi di server. Hubungi tim Neela untuk bantuan."
          )
          return
        default:
          toast.error(error.message)
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
            {connected ? "Ganti Server Key" : "Hubungkan Akun Midtrans"}
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
              <FormLabel>Server Key Midtrans</FormLabel>
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
                Ada di dashboard Midtrans → Settings → Access Keys. Key dienkripsi dan tidak akan
                ditampilkan lagi setelah disimpan.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending} className="self-start">
          {mutation.isPending
            ? "Memverifikasi..."
            : connected
              ? "Simpan Key Baru"
              : "Simpan & Hubungkan"}
        </Button>
      </form>
    </Form>
  )
}
