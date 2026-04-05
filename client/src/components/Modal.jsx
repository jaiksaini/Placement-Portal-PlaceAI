import React, { useEffect } from 'react'
import { X } from 'lucide-react'
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) { document.addEventListener('keydown', handleKey); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} card border border-white/10 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg font-semibold text-surface-50">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-surface-400 hover:text-surface-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}
