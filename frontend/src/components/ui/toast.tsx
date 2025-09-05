import * as React from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ toast, onRemove }, ref) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration || 4000)

      return () => clearTimeout(timer)
    }, [toast.id, toast.duration, onRemove])

    const getIcon = () => {
      switch (toast.type) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />
        default:
          return <Info className="h-5 w-5 text-blue-600" />
      }
    }

    const getStyles = () => {
      switch (toast.type) {
        case 'success':
          return 'border-green-200 bg-green-50'
        case 'error':
          return 'border-red-200 bg-red-50'
        default:
          return 'border-blue-200 bg-blue-50'
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-lg transition-all",
          getStyles()
        )}
      >
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            {toast.title && (
              <div className="text-sm font-medium text-gray-900">
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className="text-sm text-gray-600">
                {toast.description}
              </div>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }