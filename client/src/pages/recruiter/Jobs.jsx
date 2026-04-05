import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import SkillTag from '../../components/SkillTag'
import Toast from '../../components/Toast'
import { Plus, Trash2, Users, MapPin, Clock, Briefcase, Edit, ChevronRight } from 'lucide-react'

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get('/jobs/recruiter/myjobs').then(res => setJobs(res.data.jobs || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleToggle = async (id, current) => {
    try {
      await api.put(`/jobs/${id}`, { isActive: !current })
      setJobs(prev => prev.map(j => j._id === id ? {...j, isActive: !current} : j))
      setToast({ message: `Job ${!current ? 'activated' : 'deactivated'}`, type: 'success' })
    } catch { setToast({ message: 'Failed to update job', type: 'error' }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this job and all its applications?')) return
    try {
      await api.delete(`/jobs/${id}`)
      setJobs(prev => prev.filter(j => j._id !== id))
      setToast({ message: 'Job deleted', type: 'success' })
    } catch { setToast({ message: 'Failed to delete', type: 'error' }) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Jobs</h1>
          <p className="text-surface-400 text-sm mt-1">{jobs.filter(j => j.isActive).length} active · {jobs.length} total</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary text-sm"><Plus className="w-4 h-4" />New Job</Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card p-5 h-40 animate-pulse bg-surface-800/30" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400 mb-4">No jobs posted yet</p>
          <Link to="/recruiter/post-job" className="btn-primary text-sm inline-flex"><Plus className="w-4 h-4" />Post your first job</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`badge border ${job.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-surface-700 text-surface-500 border-surface-600/50'}`}>
                      {job.isActive ? '● Active' : '○ Closed'}
                    </span>
                    <span className="badge bg-surface-800 text-surface-400 border border-white/10">{job.type}</span>
                  </div>
                  <h3 className="text-base font-semibold text-surface-100">{job.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-surface-500 mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.experience}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationsCount || 0} applicants</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link to={`/recruiter/applicants/${job._id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />View Applicants
                    {job.applicationsCount > 0 && (
                      <span className="w-5 h-5 bg-accent-500 text-white rounded-full text-xs flex items-center justify-center ml-1">{job.applicationsCount}</span>
                    )}
                  </Link>
                  <button onClick={() => handleToggle(job._id, job.isActive)}
                    className={`text-xs py-1.5 px-3 rounded-xl border font-medium transition-all ${job.isActive ? 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'}`}>
                    {job.isActive ? 'Close' : 'Reopen'}
                  </button>
                  <button onClick={() => handleDelete(job._id)} className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
