import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import MatchScoreBadge from '../../components/MatchScoreBadge'
import SkillTag from '../../components/SkillTag'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import { FileText, MapPin, Briefcase, Trash2, Calendar, TrendingUp } from 'lucide-react'

export default function StudentApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    api.get('/applications/my').then(res => {
      setApplications(res.data.applications || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await api.delete(`/applications/${id}/withdraw`)
      setApplications(prev => prev.filter(a => a._id !== id))
      setSelected(null)
      setToast({ message: 'Application withdrawn', type: 'info' })
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to withdraw', type: 'error' })
    }
  }

  const statuses = ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired']
  const filtered = filterStatus ? applications.filter(a => a.status === filterStatus) : applications

  const avgScore = applications.length
    ? Math.round(applications.reduce((s, a) => s + a.matchScore, 0) / applications.length) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">My Applications</h1>
          <p className="text-surface-400 text-sm mt-1">{applications.length} total applications · Avg match: {avgScore}%</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus('')}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!filterStatus ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-surface-800 text-surface-400 border-white/10 hover:border-white/20'}`}>
          All ({applications.length})
        </button>
        {statuses.map(s => {
          const count = applications.filter(a => a.status === s).length
          if (!count) return null
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all capitalize ${filterStatus === s ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-surface-800 text-surface-400 border-white/10 hover:border-white/20'}`}>
              {s} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-4 h-20 animate-pulse bg-surface-800/30" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400">No applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => (
            <div key={app._id} className="card-hover p-4 cursor-pointer" onClick={() => setSelected(app)}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-surface-100">{app.job?.title}</h3>
                      <p className="text-sm text-surface-400">{app.job?.company} · {app.job?.location}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <MatchScoreBadge score={app.matchScore} />
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{app.job?.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title="Application Details" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-800/50">
              <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-100">{selected.job?.title}</h3>
                <p className="text-sm text-surface-400">{selected.job?.company}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50">
              <StatusBadge status={selected.status} />
              <MatchScoreBadge score={selected.matchScore} size="lg" />
            </div>
            {selected.job?.skillsRequired?.length > 0 && (
              <div>
                <p className="text-sm text-surface-400 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selected.job.skillsRequired.map(s => <SkillTag key={s} skill={s} variant="primary" />)}
                </div>
              </div>
            )}
            {selected.coverLetter && (
              <div>
                <p className="text-sm text-surface-400 mb-2">Your Cover Letter</p>
                <p className="text-sm text-surface-300 bg-surface-800/50 p-3 rounded-xl leading-relaxed">{selected.coverLetter}</p>
              </div>
            )}
            {selected.notes && (
              <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <p className="text-xs text-amber-400 font-semibold mb-1">Recruiter Note</p>
                <p className="text-sm text-surface-300">{selected.notes}</p>
              </div>
            )}
            {selected.status === 'applied' && (
              <button onClick={() => handleWithdraw(selected._id)} className="btn-danger w-full justify-center text-sm">
                <Trash2 className="w-4 h-4" /> Withdraw Application
              </button>
            )}
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
