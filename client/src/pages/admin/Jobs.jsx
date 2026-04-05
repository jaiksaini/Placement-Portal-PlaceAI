import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Toast from '../../components/Toast'
import SkillTag from '../../components/SkillTag'
import { Briefcase, Search, Trash2, MapPin, Users, Clock, Building2 } from 'lucide-react'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get('/admin/jobs').then(res => setJobs(res.data.jobs || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))
    : jobs

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}" and all its applications?`)) return
    try {
      await api.delete(`/admin/jobs/${id}`)
      setJobs(prev => prev.filter(j => j._id !== id))
      setToast({ message: 'Job deleted successfully', type: 'success' })
    } catch {
      setToast({ message: 'Failed to delete job', type: 'error' })
    }
  }

  const toggleJob = async (id, current) => {
    try {
      await api.put(`/jobs/${id}`, { isActive: !current })
      setJobs(prev => prev.map(j => j._id === id ? { ...j, isActive: !current } : j))
      setToast({ message: `Job ${!current ? 'activated' : 'deactivated'}`, type: 'success' })
    } catch {
      setToast({ message: 'Failed to update job', type: 'error' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Manage Jobs</h1>
        <p className="text-surface-400 text-sm mt-1">{filtered.length} jobs · {jobs.filter(j => j.isActive).length} active</p>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" className="input pl-10" placeholder="Search jobs or companies..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="card p-5 h-32 animate-pulse bg-surface-800/30" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <div key={job._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge border text-xs ${job.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-surface-700 text-surface-500 border-surface-600/50'}`}>
                      {job.isActive ? '● Active' : '○ Closed'}
                    </span>
                    <span className="badge bg-surface-800 text-surface-400 border border-white/10 text-xs">{job.type}</span>
                  </div>
                  <h3 className="font-semibold text-surface-100">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-surface-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationsCount || 0} applicants</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.experience}</span>
                  </div>
                  <p className="text-xs text-surface-500 mt-1">
                    Posted by: <span className="text-surface-400">{job.recruiter?.name}</span> ({job.recruiter?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleJob(job._id, job.isActive)}
                    className={`text-xs py-1.5 px-3 rounded-xl border font-medium transition-all ${
                      job.isActive
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
                        : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                    }`}>
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(job._id, job.title)}
                    className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {job.skillsRequired?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                  {job.skillsRequired.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
