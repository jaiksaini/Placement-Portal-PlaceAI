import React from 'react'
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <p className="text-surface-400 text-sm animate-pulse">Loading PlaceAI...</p>
      </div>
    </div>
  )
}
