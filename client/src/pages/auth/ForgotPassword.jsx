import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { Mail, ArrowLeft, Zap, Send } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent-500/6 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        {!sent ? (
          <div className="card p-8 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-accent-500/15 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-accent-400" />
            </div>
            <h2 className="text-2xl font-semibold text-surface-50 mb-1">Forgot password?</h2>
            <p className="text-surface-400 text-sm mb-6">
              Enter your email and we'll send a reset link — no problem!
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
                {!loading && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="card p-8 border border-emerald-500/20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-surface-50 mb-2">Check your inbox</h2>
            <p className="text-surface-400 text-sm mb-2">
              If <span className="text-surface-200 font-medium">{email}</span> exists in our system, a reset link has been sent.
            </p>
            <p className="text-xs text-surface-500 mb-6">Check your server terminal if using test mode.</p>
            <Link to="/login" className="btn-secondary w-full justify-center text-sm">Back to login</Link>
          </div>
        )}
      </div>
    </div>
  )
}
