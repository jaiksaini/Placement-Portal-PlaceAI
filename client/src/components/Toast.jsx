import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  const cfg = {
    success: { icon: CheckCircle, classes: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
    error: { icon: XCircle, classes: 'bg-red-500/15 border-red-500/30 text-red-400' },
    info: { icon: AlertCircle, classes: 'bg-primary-500/15 border-primary-500/30 text-primary-400' },
  }
  const { icon: Icon, classes } = cfg[type] || cfg.info
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl animate-slide-up ${classes} max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium text-surface-100 flex-1">{message}</p>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}
