import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { GraduationCap, Building2, Eye, EyeOff, ArrowRight, Zap, Mail, CheckCircle, RefreshCw } from 'lucide-react'

export default function Register() {
  const [step, setStep] = useState('form') // 'form' | 'verify'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', company: '', designation: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      setRegisteredEmail(form.email)
      setStep('verify')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendMsg('')
    try {
      const res = await api.post('/auth/resend-verification', { email: registeredEmail })
      setResendMsg(res.data.message)
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend. Try again.')
    } finally {
      setResending(false)
    }
  }

  // ── Email Sent Screen ───────────────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/6 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-md text-center">
          {/* Animated envelope icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <Mail className="w-12 h-12 text-primary-400" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-surface-50 mb-3">Check your inbox!</h1>
          <p className="text-surface-400 mb-2">We've sent a verification link to:</p>
          <p className="text-primary-400 font-semibold text-lg mb-6 font-mono">{registeredEmail}</p>

          <div className="card p-5 text-left mb-6 border border-white/10">
            <p className="text-sm font-semibold text-surface-200 mb-3">Next steps:</p>
            {[
              { n: '1', text: 'Open the email from PlaceAI' },
              { n: '2', text: 'Click the "Verify My Email" button' },
              { n: '3', text: "You'll be automatically logged in" },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-400">{n}</span>
                </div>
                <span className="text-sm text-surface-400">{text}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 text-left mb-6">
            <p className="text-xs text-amber-400 font-semibold mb-1">🧪 Using test mode?</p>
            <p className="text-xs text-surface-400">Check the <strong className="text-surface-200">server terminal</strong> — it prints a preview URL you can open to see the email without a real inbox.</p>
          </div>

          {resendMsg && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${resendMsg.includes('resent') || resendMsg.includes('sent') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {resendMsg}
            </div>
          )}

          <button onClick={handleResend} disabled={resending}
            className="btn-secondary w-full justify-center mb-4">
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Resending...' : 'Resend verification email'}
          </button>

          <p className="text-sm text-surface-500">
            Wrong email?{' '}
            <button onClick={() => setStep('form')} className="text-primary-400 hover:text-primary-300 font-medium">
              Go back and re-register
            </button>
          </p>
          <p className="text-sm text-surface-500 mt-2">
            Already verified?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  // ── Register Form ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-500/6 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-surface-50">PlaceAI</span>
        </Link>

        <div className="card p-8 border border-white/10">
          <h2 className="text-2xl font-semibold text-surface-50 mb-1 text-center">Create Account</h2>
          <p className="text-surface-400 text-sm mb-6 text-center">Join thousands of students & recruiters</p>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[{ role: 'student', icon: GraduationCap, label: 'I am a Student' },
              { role: 'recruiter', icon: Building2, label: 'I am a Recruiter' }].map(({ role, icon: Icon, label }) => (
              <button key={role} type="button" onClick={() => setForm(p => ({ ...p, role }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  form.role === role
                    ? 'bg-primary-500/15 border-primary-500/40 text-primary-400'
                    : 'border-white/10 text-surface-400 hover:border-white/20 hover:text-surface-200'
                }`}>
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            {form.role === 'recruiter' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Company</label>
                  <input className="input" placeholder="Google" value={form.company} onChange={set('company')} />
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input className="input" placeholder="HR Manager" value={form.designation} onChange={set('designation')} />
                </div>
              </div>
            )}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input pr-10"
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[6, 8, 12].map((len, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      form.password.length >= len
                        ? i === 0 ? 'bg-red-500' : i === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                        : 'bg-surface-700'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-surface-500">
                  {form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Good' : '💪 Strong'}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
