import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { CheckCircle, XCircle, Loader, Zap } from 'lucide-react'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { authenticate } = useAuth()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`)
        // Use centralized authenticate to sync React state + localStorage + axios headers
        authenticate(res.data.token, res.data.user)
        setStatus('success')
        setMessage(res.data.message)
        // Redirect to dashboard after 2.5s
        setTimeout(() => navigate(`/${res.data.user.role}/dashboard`, { replace: true }), 2500)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.')
      }
    }
    verify()
  }, [token])


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-500/6 rounded-full blur-3xl" />
      </div>
      <div className="relative text-center max-w-md w-full">
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-surface-50">PlaceAI</span>
        </div>

        <div className="card p-10 border border-white/10">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-500/15 flex items-center justify-center mx-auto mb-5">
                <Loader className="w-8 h-8 text-primary-400 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-surface-50 mb-2">Verifying your email…</h2>
              <p className="text-surface-400 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-5 animate-bounce">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-surface-50 mb-2">Email Verified! 🎉</h2>
              <p className="text-surface-400 text-sm mb-4">{message}</p>
              <p className="text-surface-500 text-xs">Redirecting you to your dashboard…</p>
              <div className="mt-4 h-1 bg-surface-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-[slideRight_2.5s_linear_forwards]"
                  style={{ animation: 'width 2.5s linear forwards', width: '100%' }} />
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-surface-50 mb-2">Verification Failed</h2>
              <p className="text-surface-400 text-sm mb-6">{message}</p>
              <div className="space-y-3">
                <Link to="/register" className="btn-primary w-full justify-center">
                  Register again
                </Link>
                <Link to="/login" className="btn-secondary w-full justify-center text-sm">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
