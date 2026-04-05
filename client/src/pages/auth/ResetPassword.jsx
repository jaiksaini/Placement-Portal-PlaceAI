import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Link may be expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        {success ? (
          <div className="card p-8 border border-emerald-500/20 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5 animate-bounce">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-surface-50 mb-2">Password Reset!</h2>
            <p className="text-surface-400 text-sm">Redirecting you to login…</p>
          </div>
        ) : (
          <div className="card p-8 border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-primary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-surface-50 mb-1">Set new password</h2>
            <p className="text-surface-400 text-sm mb-6">Choose a strong password for your account.</p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input pr-10"
                    placeholder="Min. 6 characters" value={password}
                    onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input" placeholder="Repeat password"
                  value={confirm} onChange={e => setConfirm(e.target.value)} required />
                {confirm && password !== confirm && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
              </div>
              <button type="submit" disabled={loading || password !== confirm}
                className="btn-primary w-full justify-center py-3">
                {loading ? 'Resetting...' : 'Reset Password'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
            <p className="text-center text-sm text-surface-500 mt-4">
              <Link to="/login" className="text-primary-400 hover:text-primary-300">Back to login</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
