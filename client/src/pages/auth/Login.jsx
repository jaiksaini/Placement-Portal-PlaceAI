import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff, Zap, ArrowRight, Mail, RefreshCw } from 'lucide-react'
import api from '../../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const quickFill = (role) => {
    const creds = {
      admin:     { email: 'admin@portal.com',          password: 'admin123' },
      recruiter: { email: 'recruiter@google.com',      password: 'recruiter123' },
      student:   { email: 'alice@student.com',         password: 'student123' },
    }
    setForm(creds[role])
    setError('')
    setNeedsVerification(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNeedsVerification(false)
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(`/${user.role}/dashboard`, { replace: true })
    } catch (err) {
      const data = err.response?.data
      if (data?.requiresVerification) {
        setNeedsVerification(true)
        setError(data.message)
      } else {
        setError(data?.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendMsg('')
    try {
      const res = await api.post('/auth/resend-verification', { email: form.email })
      setResendMsg(res.data.message)
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center p-16 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-surface-50">PlaceAI</span>
          </div>
          <h1 className="font-display text-5xl font-semibold text-surface-50 leading-tight mb-4">
            Your Career,<br /><em className="text-primary-400 not-italic">Intelligently</em> Matched
          </h1>
          <p className="text-surface-400 text-lg leading-relaxed mb-10">
            AI-powered placement portal connecting students with their ideal roles.
          </p>
          <div className="space-y-4">
            {[
              { icon: '🎯', text: 'AI-based resume & skill matching' },
              { icon: '📊', text: 'Real-time application tracking' },
              { icon: '🚀', text: 'Smart job recommendations' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-surface-400">
                <span className="text-xl">{icon}</span>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center p-8 lg:p-12">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-surface-50">PlaceAI</span>
        </div>

        <h2 className="text-2xl font-semibold text-surface-50 mb-1">Welcome back</h2>
        <p className="text-surface-400 text-sm mb-6">Sign in to your account to continue</p>

        {/* Quick Login Buttons */}
        <div className="mb-6">
          <p className="text-xs text-surface-500 mb-2 font-medium uppercase tracking-wide">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {['admin', 'recruiter', 'student'].map(r => (
              <button key={r} onClick={() => quickFill(r)}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-surface-300 capitalize transition-all">
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Error / Verification Banner */}
        {error && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
            needsVerification
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{error}</p>
                {needsVerification && (
                  <button onClick={handleResend} disabled={resending}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors">
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
                {resendMsg && <p className="mt-1 text-xs text-emerald-400">{resendMsg}</p>}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-surface-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Create account</Link>
        </p>
      </div>
    </div>
  )
}
