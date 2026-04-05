import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        // Guard against corrupted/undefined user data from old sessions
        if (parsed && parsed._id) {
          setUser(parsed)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  /** Centralized helper: sets token + user in storage, axios & React state */
  const authenticate = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    authenticate(token, user)
    return user
  }

  /**
   * register() only submits data to the server.
   * It does NOT log the user in — email verification is required first.
   * Returns the server response data (message, requiresVerification, email).
   */
  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    const merged = { ...(user || {}), ...updatedUser }
    setUser(merged)
    localStorage.setItem('user', JSON.stringify(merged))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, authenticate }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
