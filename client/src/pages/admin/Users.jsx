import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Toast from '../../components/Toast'
import SkillTag from '../../components/SkillTag'
import { Users, Search, Shield, Trash2, GraduationCap, Building2, ChevronDown, X } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [toast, setToast] = useState(null)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    api.get(`/admin/users?${params}`).then(res => setUsers(res.data.users || [])).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, roleFilter])

  const toggleUser = async (id, current) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`)
      setUsers(prev => prev.map(u => u._id === id ? {...u, isActive: !current} : u))
      setToast({ message: `User ${!current ? 'activated' : 'deactivated'}`, type: 'success' })
    } catch { setToast({ message: 'Action failed', type: 'error' }) }
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete ${name}? This will also delete all their applications.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      setToast({ message: 'User deleted', type: 'success' })
    } catch { setToast({ message: 'Delete failed', type: 'error' }) }
  }

  const roleIcon = (role) => {
    if (role === 'student') return <GraduationCap className="w-4 h-4 text-primary-400" />
    if (role === 'recruiter') return <Building2 className="w-4 h-4 text-accent-400" />
    return <Shield className="w-4 h-4 text-emerald-400" />
  }

  const roleBadge = (role) => {
    const m = { student: 'bg-primary-500/15 text-primary-400 border-primary-500/30', recruiter: 'bg-accent-500/15 text-accent-400 border-accent-500/30', admin: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' }
    return <span className={`badge border ${m[role] || m.student} capitalize`}>{role}</span>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Manage Users</h1>
        <p className="text-surface-400 text-sm mt-1">{users.length} users found</p>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" className="input pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['', 'student', 'recruiter', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${roleFilter === r ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-surface-800 text-surface-400 border-white/10 hover:border-white/20'}`}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="card p-4 h-16 animate-pulse bg-surface-800/30" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wide">User</th>
                  <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wide">Role</th>
                  <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wide hidden md:table-cell">Skills / Company</th>
                  <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wide">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-sm font-medium text-surface-300">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-surface-100">{user.name}</p>
                          <p className="text-xs text-surface-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{roleBadge(user.role)}</td>
                    <td className="p-4 hidden md:table-cell">
                      {user.role === 'student' ? (
                        <div className="flex flex-wrap gap-1">
                          {user.skills?.slice(0, 3).map(s => <SkillTag key={s} skill={s} />)}
                          {(user.skills?.length || 0) > 3 && <span className="text-xs text-surface-500">+{user.skills.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-sm text-surface-400">{user.company || '—'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`badge border ${user.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.role !== 'admin' && (
                          <>
                            <button onClick={() => toggleUser(user._id, user.isActive)}
                              className={`text-xs py-1 px-2.5 rounded-lg border transition-all ${user.isActive ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'}`}>
                              {user.isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => deleteUser(user._id, user.name)}
                              className="p-1 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-surface-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-surface-700" />
                No users found
              </div>
            )}
          </div>
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
