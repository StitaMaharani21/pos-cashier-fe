import type { ReactNode } from "react"

import { useCapabilities } from "./useCapabilities"
import { LockedPage } from "./LockedPage"
import type { Action, Feature, Module } from "./types"

interface RequireAccessProps {
  feature?: Feature
  module?: Module
  action?: Action
  children: ReactNode
}

export function RequireAccess({ feature, module, action = "view", children }: RequireAccessProps) {
  const { isLoading, featureState, can } = useCapabilities()

  if (isLoading) return <PageSkeleton />

  const state = featureState(feature)
  // Hidden features (Enterprise-only, e.g. multi_outlet/custom_rbac) render
  // as not-found rather than a locked/upsell page — the store shouldn't even
  // learn the feature exists yet.
  if (state === "hidden") return <NotFoundPage />
  if (state === "locked") return <LockedPage feature={feature!} />
  if (!can(module, action)) return <ForbiddenPage />

  return <>{children}</>
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card py-24 text-center">
      <h1 className="text-xl font-semibold">Halaman Ini Tidak Bisa Dibuka</h1>
      <p className="text-sm text-muted-foreground">
        Hubungi pemilik toko bila Anda perlu akses ke halaman ini.
      </p>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-card py-24 text-center">
      <h1 className="text-xl font-semibold">Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-muted-foreground">Coba kembali ke Beranda.</p>
    </div>
  )
}
