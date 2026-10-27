import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import type { PaymentMethodType } from "@/entities/payment-method/model/payment-method.types"
import {
  channelAccountSchema,
  type ChannelAccountFormValues,
} from "@/modules/owner/payment-method/schemas/channel-account.schema"
import { useCrudForm } from "@/shared/hooks/useCrudForm"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

export interface ChannelAccountSubmit {
  provider: string
  accountNumber: string
  accountName: string
}

interface ChannelAccountDialogProps {
  type: Extract<PaymentMethodType, "transfer" | "ewallet">
  open: boolean
  // Set = editing that account (the provider is locked); null = adding.
  editing: PaymentChannel | null
  // Providers not yet added to the store (a store has one account per provider).
  availableProviders: string[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ChannelAccountSubmit) => void
}

// "Tambah Bank" / "Tambah E-Wallet" form. Saves straight to the server on
// "Simpan" — unlike the card/QRIS settings, there is no separate draft.
export function ChannelAccountDialog({ open, onOpenChange, ...formProps }: ChannelAccountDialogProps) {
  const isBank = formProps.type === "transfer"
  const label = isBank ? "Bank" : "E-Wallet"
  const editing = formProps.editing != null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit" : "Tambah"} {label}
          </DialogTitle>
          <DialogDescription>
            {isBank
              ? "Rekening ini ditampilkan kasir ke pelanggan yang membayar dengan transfer."
              : "Nomor ini ditampilkan kasir ke pelanggan yang membayar dengan e-wallet."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so every open starts from fresh defaults. */}
        <ChannelAccountForm {...formProps} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function ChannelAccountForm({
  type,
  editing,
  availableProviders,
  isSubmitting,
  onSubmit,
  onCancel,
}: Omit<ChannelAccountDialogProps, "open" | "onOpenChange"> & { onCancel: () => void }) {
  const isBank = type === "transfer"
  const label = isBank ? "Bank" : "E-Wallet"
  const form = useCrudForm({
    schema: channelAccountSchema,
    defaultValues: {
      provider: editing?.name ?? "",
      accountNumber: editing?.account_number ?? "",
      accountName: editing?.account_name ?? "",
    },
  })

  function handleSubmit(values: ChannelAccountFormValues) {
    onSubmit({
      provider: values.provider,
      accountNumber: values.accountNumber.trim(),
      accountName: values.accountName.trim(),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pilih {label}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={editing != null}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(editing?.name ? [editing.name] : availableProviders).map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isBank ? "Nomor Rekening" : "Nomor HP"}</FormLabel>
              <FormControl>
                <Input
                  inputMode="tel"
                  maxLength={50}
                  placeholder={isBank ? "mis. 123 456 7890" : "mis. 0812 3456 7890"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Atas Nama</FormLabel>
              <FormControl>
                <Input
                  maxLength={100}
                  placeholder={isBank ? "Nama pemilik rekening" : "Nama pemilik akun e-wallet"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
