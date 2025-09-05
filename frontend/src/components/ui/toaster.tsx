import * as React from "react"
import { createPortal } from "react-dom"
import { Toast, type Toast as ToastType } from "./toast"

interface ToasterProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  )
}