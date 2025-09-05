import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const toast = {
    success: (message: string) => addToast({ description: message, type: 'success' }),
    error: (message: string) => addToast({ description: message, type: 'error' }),
    info: (message: string) => addToast({ description: message, type: 'info' })
  }

  return { toasts, removeToast, toast }
}