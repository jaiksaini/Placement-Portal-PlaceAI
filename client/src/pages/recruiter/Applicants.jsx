import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import MatchScoreBadge from '../../components/MatchScoreBadge'
import SkillTag from '../../components/SkillTag'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import { ArrowLeft, Users, FileText, User, Zap, ChevronDown } from 'lucide-react'

const STATUSES = ['applied','reviewing','shortlisted','rejected','hired']

export default function Applicants() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    Promise.all([api.get(`/jobs/${jobId}`), api.get(`/jobs/${jobId}/applicants`)])
      .then(([jobRes, appsRes]) => {
        setJob(jobRes.data.job)
        setApplications(appsRes.data.applications || [])
      }).catch(console.error).finally(() => setLoading(false))
  }, [jobId])

  const updateStatus = async (appId, status, notes = '') => {
    try {
      await api.put(`/applications/${appId}/status`, { status, notes })
      setApplications(prev => prev.map(a => a._id === appId ? {...a, status, notes} : a))
      if (selected?._id === appId) setSelected(p => ({...p, status, notes}))
      setToast({ message: `Status updated to ${status}`, type: 'success' })
    } catch { setToast({ message: 'Failed to update status', type: 'error' }) }
  }

  const filtered = filterStatus ? applications.filter(a => a.status === filterStatus) : applications
  const sorted = [...filtered].sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/recruiter/jobs" className="p-2 rounded-xl hover:bg-white/10 text-surface-400 transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="section-title">{job?.title || 'Applicants'}</h1>
          <p className="text-surface-400 text-sm mt-0.5">{job?.company} · {applications.length} total applications</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus('')}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!filterStatus ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-surface-800 text-surface-400 border-white/10'}`}>
          All ({applications.length})
        </button>
        {STATUSES.map(s => {
          const cnt = applications.filter(a => a.status === s).length
          if (!cnt) return null
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all ${filterStatus === s ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-surface-800 text-surface-400 border-white/10'}`}>
              {s} ({cnt})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-4 h-20 animate-pulse" />)}</div>
      ) : sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400">No applicants yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((app, idx) => (
            <div key={app._id} className="card-hover p-4 cursor-pointer" onClick={() => setSelected(app)}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-surface-300">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-surface-100">{app.student?.name}</p>
                    <p className="text-xs text-surface-500">{app.student?.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {app.student?.skills?.slice(0, 4).map(s => <SkillTag key={s} skill={s} />)}
                    {(app.student?.skills?.length || 0) > 4 && <span className="text-xs text-surface-500 self-center">+{app.student.skills.length - 4}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <MatchScoreBadge score={app.matchScore} />
                  <StatusBadge status={app.status} />
                  {app.student?.resumeUrl && (
                    <a href={app.student.resumeUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-primary-400 transition-all">
                      <FileText className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicant Detail Modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={selected.student?.name} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MatchScoreBadge score={selected.matchScore} size="lg" />
              <div className="flex flex-col justify-center gap-2">
                <p className="text-xs text-surface-500">Current Status</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            {selected.student?.bio && (
              <div><p className="text-xs text-surface-500 mb-1">Bio</p>
                <p className="text-sm text-surface-300 leading-relaxed">{selected.student.bio}</p>
              </div>
            )}

            {selected.student?.skills?.length > 0 && (
              <div><p className="text-xs text-surface-500 mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selected.student.skills.map(s => (
                    <SkillTag key={s} skill={s}
                      variant={job?.skillsRequired?.some(js => js.toLowerCase() === s.toLowerCase()) ? 'success' : 'default'} />
                  ))}
                </div>
              </div>
            )}

            {selected.student?.education?.length > 0 && (
              <div><p className="text-xs text-surface-500 mb-2">Education</p>
                {selected.student.education.map((edu, i) => (
                  <div key={i} className="text-sm text-surface-300">{edu.degree} in {edu.field} – {edu.institution} ({edu.year})</div>
                ))}
              </div>
            )}

            {selected.coverLetter && (
              <div><p className="text-xs text-surface-500 mb-1">Cover Letter</p>
                <p className="text-sm text-surface-300 bg-surface-800/50 p-3 rounded-xl leading-relaxed">{selected.coverLetter}</p>
              </div>
            )}

            {/* Status Update */}
            <div>
              <p className="text-xs text-surface-500 mb-2">Update Application Status</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border capitalize transition-all ${selected.status === s ? 'bg-accent-500/20 border-accent-500/40 text-accent-300' : 'border-white/10 text-surface-400 hover:border-white/20 hover:text-surface-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {selected.student?.resumeUrl && (
              <a href={selected.student.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center text-sm">
                <FileText className="w-4 h-4" />View Resume
              </a>
            )}
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
