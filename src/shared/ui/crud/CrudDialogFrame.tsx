import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

interface CrudDialogFrameProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  footer?: ReactNode
  children: ReactNode
}

export function CrudDialogFrame({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: CrudDialogFrameProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
