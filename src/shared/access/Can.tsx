import type { ReactNode } from "react"

import { useCapabilities } from "./useCapabilities"
import type { Action, Module } from "./types"

interface CanProps {
  module: Module
  action: Action
  children: ReactNode
}

export function Can({ module, action, children }: CanProps) {
  const { can } = useCapabilities()
  return can(module, action) ? <>{children}</> : null
}
