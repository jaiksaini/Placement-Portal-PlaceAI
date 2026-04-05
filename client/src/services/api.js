import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-redirect on 401 for protected routes, not auth endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthRoute = [
        '/auth/login', '/auth/register', '/auth/verify-email',
        '/auth/forgot-password', '/auth/reset-password', '/auth/resend-verification'
      ].some(path => url.includes(path))

      if (!isAuthRoute) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
