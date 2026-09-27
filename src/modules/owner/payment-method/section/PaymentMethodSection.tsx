import { useCallback, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { InfoIcon } from "lucide-react"
import { toast } from "sonner"

import type {
  PaymentMethod,
  PaymentMethodPayload,
  PaymentMethodType,
} from "@/entities/payment-method/model/payment-method.types"
import type { PaymentChannel } from "@/entities/payment-channel/model/payment-channel.types"
import {
  createPaymentChannel,
  createPaymentMethod,
  listPaymentChannels,
  listPaymentMethods,
  updatePaymentChannel,
  updatePaymentMethod,
} from "@/modules/owner/payment-method/api/payment-method.service"
import { MethodDetailPanel } from "@/modules/owner/payment-method/components/MethodDetailPanel"
import { MethodListItem } from "@/modules/owner/payment-method/components/MethodListItem"
import { channelKey, channelOptions, type MethodDraft } from "@/modules/owner/payment-method/components/method-draft"
import { CHANNEL_TYPE_FOR, METHOD_TYPES } from "@/modules/owner/payment-method/constants/payment-providers"
import { CrudServiceError } from "@/shared/api/crud/types"
import { Button } from "@/shared/ui/button"

const METHODS_KEY = ["payment-methods"]
const CHANNELS_KEY = ["payment-channels"]

type MethodConfig = (typeof METHOD_TYPES)[number]

// The screen manages one payment method per type. A store may still have
// several rows of a type from the old free-form screen — the oldest one is
// the one managed here.
function methodFor(type: PaymentMethodType, methods: PaymentMethod[]): PaymentMethod | undefined {
  return methods
    .filter((method) => method.type === type)
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))[0]
}

// Full PUT/POST body from the saved method, with `overrides` on top — the
// backend replaces every field, so untouched ones must be resent.
function methodPayload(
  config: MethodConfig,
  method: PaymentMethod | undefined,
  overrides: Partial<PaymentMethodPayload> = {}
): PaymentMethodPayload {
  return {
    name: config.name,
    type: config.type,
    status: method?.status ?? "inactive",
    card_types: (method?.card_types ?? []) as PaymentMethodPayload["card_types"],
    card_networks: (method?.card_networks ?? []) as PaymentMethodPayload["card_networks"],
    credit_surcharge_percent: method?.credit_surcharge_percent ?? 0,
    ...overrides,
  }
}

function summaryFor(config: MethodConfig, method: PaymentMethod | undefined, channels: PaymentChannel[]): string {
  const channelType = CHANNEL_TYPE_FOR[config.type]
  const activeChannels = channels.filter((channel) => channel.type === channelType && channel.status === "active")
  switch (config.type) {
    case "card": {
      const count = method?.card_networks?.length ?? 0
      return count > 0 ? `${count} jenis kartu diterima` : "Belum ada jaringan kartu"
    }
    case "transfer":
      return activeChannels.length > 0 ? `${activeChannels.length} bank` : "Belum ada bank"
    case "ewallet":
      return activeChannels.length > 0
        ? activeChannels.map((channel) => channel.name).join(", ")
        : "Belum ada e-wallet"
    case "qris":
      return method?.image_url ? "QR sudah diunggah" : "QR belum diunggah"
    default:
      return config.description
  }
}

function errorMessage(error: unknown): string {
  return error instanceof CrudServiceError ? error.message : "Terjadi kesalahan"
}

export function PaymentMethodSection() {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState<PaymentMethodType>(METHOD_TYPES[0].type)
  // Bumped to remount (= reset) the detail panel after "Batal" or a save.
  const [panelVersion, setPanelVersion] = useState(0)
  const [dirty, setDirty] = useState(false)

  const methodsQuery = useQuery({ queryKey: METHODS_KEY, queryFn: listPaymentMethods })
  const channelsQuery = useQuery({ queryKey: CHANNELS_KEY, queryFn: listPaymentChannels })
  const methods = methodsQuery.data ?? []
  const channels = channelsQuery.data ?? []

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: METHODS_KEY }),
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEY }),
    ])

  const toggleMutation = useMutation({
    mutationFn: ({ config, next }: { config: MethodConfig; next: boolean }) => {
      const method = methodFor(config.type, methods)
      const payload = methodPayload(config, method, { status: next ? "active" : "inactive" })
      return method?.id != null ? updatePaymentMethod(method.id, payload) : createPaymentMethod(payload)
    },
    onSuccess: (_, { config, next }) => {
      toast.success(`${config.name} ${next ? "diaktifkan" : "dinonaktifkan"}`)
      refresh()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  const saveMutation = useMutation({
    mutationFn: async ({ config, draft }: { config: MethodConfig; draft: MethodDraft }) => {
      const method = methodFor(config.type, methods)

      if (config.type === "card" || config.type === "qris") {
        const payload = methodPayload(
          config,
          method,
          config.type === "card"
            ? {
                card_types: draft.cardTypes,
                card_networks: draft.cardNetworks,
                credit_surcharge_percent: Number(draft.surcharge || 0),
              }
            : { image: draft.qrisImage }
        )
        await (method?.id != null ? updatePaymentMethod(method.id, payload) : createPaymentMethod(payload))
      }

      const channelType = CHANNEL_TYPE_FOR[config.type]
      if (channelType && config.type !== "card") {
        const options = channelOptions(config.type, channels)
        for (const [index, option] of options.entries()) {
          const wanted = draft.channels[channelKey(option.name)] ?? false
          const existing = option.channel
          if (existing?.id != null) {
            if ((existing.status === "active") !== wanted) {
              await updatePaymentChannel(existing.id, {
                type: channelType,
                name: existing.name ?? option.name,
                status: wanted ? "active" : "inactive",
                sort_order: existing.sort_order,
              })
            }
          } else if (wanted) {
            await createPaymentChannel({ type: channelType, name: option.name, status: "active", sort_order: index })
          }
        }
      }
    },
    onSuccess: async (_, { config }) => {
      toast.success(`Pengaturan ${config.name} disimpan`)
      await refresh()
      setPanelVersion((version) => version + 1)
    },
    // Channels are saved one by one — refresh so a partial save shows as is.
    onError: (error) => {
      toast.error(errorMessage(error))
      refresh()
    },
  })

  const onDirtyChange = useCallback((value: boolean) => setDirty(value), [])

  function select(type: PaymentMethodType) {
    if (type === selectedType) return
    if (dirty && !window.confirm("Perubahan yang belum disimpan akan hilang. Lanjutkan?")) return
    setSelectedType(type)
    setDirty(false)
  }

  if (methodsQuery.isPending || channelsQuery.isPending) {
    return <div className="h-96 animate-pulse rounded-2xl border bg-muted/40" />
  }

  if (methodsQuery.isError || channelsQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">Gagal memuat metode pembayaran.</p>
        <Button variant="outline" onClick={() => refresh()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  const rows = METHOD_TYPES.map((config) => {
    const method = methodFor(config.type, methods)
    return { config, method, active: method?.status === "active" }
  })
  const activeCount = rows.filter((row) => row.active).length
  const selected = rows.find((row) => row.config.type === selectedType) ?? rows[0]
  const togglingType = toggleMutation.isPending ? toggleMutation.variables?.config.type : undefined

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Metode Pembayaran</h1>
          <p className="text-sm text-muted-foreground">
            {activeCount} dari {METHOD_TYPES.length} metode aktif
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
          <InfoIcon className="size-4 shrink-0 text-primary" />
          Metode nonaktif tidak akan muncul di kasir &amp; aplikasi pelanggan
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Daftar Metode Pembayaran
          </p>
          {rows.map(({ config, method, active }) => (
            <MethodListItem
              key={config.type}
              type={config.type}
              name={config.name}
              summary={summaryFor(config, method, channels)}
              active={active}
              selected={config.type === selected.config.type}
              toggling={togglingType === config.type}
              onSelect={() => select(config.type)}
              onToggle={(next) => toggleMutation.mutate({ config, next })}
            />
          ))}
        </div>

        <MethodDetailPanel
          key={`${selected.config.type}-${panelVersion}`}
          type={selected.config.type}
          name={selected.config.name}
          description={selected.config.description}
          method={selected.method}
          channels={channels}
          active={selected.active}
          toggling={togglingType === selected.config.type}
          isSaving={saveMutation.isPending}
          onToggle={(next) => toggleMutation.mutate({ config: selected.config, next })}
          onSave={(draft) => saveMutation.mutate({ config: selected.config, draft })}
          onCancel={() => setPanelVersion((version) => version + 1)}
          onDirtyChange={onDirtyChange}
        />
      </div>
    </div>
  )
}
