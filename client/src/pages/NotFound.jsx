import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-surface-500" />
        </div>
        <h1 className="font-display text-6xl font-semibold text-surface-50 mb-3">404</h1>
        <p className="text-surface-400 mb-8 text-lg">Page not found</p>
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  )
}
