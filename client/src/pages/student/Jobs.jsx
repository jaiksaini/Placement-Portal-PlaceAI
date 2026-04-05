import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import JobCard from '../../components/JobCard'
import Modal from '../../components/Modal'
import Toast from '../../components/Toast'
import SkillTag from '../../components/SkillTag'
import MatchScoreBadge from '../../components/MatchScoreBadge'
import { Search, X, MapPin, Briefcase, Clock, Zap, TrendingUp, AlertCircle, Link as LinkIcon } from 'lucide-react'

export default function StudentJobs() {
  const { user } = useAuth()
  const [allJobs, setAllJobs]       = useState([])   // jobs with AI scores
  const [filtered, setFiltered]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [scoreLoading, setScoreLoading] = useState(false)
  const [search, setSearch]         = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterSkill, setFilterSkill] = useState('')
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [selectedJob, setSelectedJob] = useState(null)
  const [applying, setApplying]     = useState(false)
  const [toast, setToast]           = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [activeTab, setActiveTab]   = useState('all')  // 'all' | 'recommended'

  // ── Load applied job IDs ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/applications/my').then(res => {
      setAppliedIds(new Set(res.data.applications.map(a => a.job?._id)))
    }).catch(console.error)
  }, [])

  // ── Load jobs with AI match scores ─────────────────────────────────────────
  const loadJobsWithScores = useCallback(async () => {
    setLoading(true)
    try {
      let jobs = []
      if (user?.skills?.length > 0) {
        // Fetch AI-scored recommended jobs
        setScoreLoading(true)
        const res = await api.get('/jobs/recommended')
        jobs = res.data.jobs || []
        setScoreLoading(false)
      } else {
        // No skills — just fetch all jobs without scores
        const res = await api.get('/jobs?limit=50')
        jobs = (res.data.jobs || []).map(j => ({ ...j, matchScore: 0 }))
      }
      setAllJobs(jobs)
    } catch (err) {
      console.error(err)
      setToast({ message: 'Failed to load jobs', type: 'error' })
    } finally {
      setLoading(false)
      setScoreLoading(false)
    }
  }, [user?.skills])

  useEffect(() => { loadJobsWithScores() }, [loadJobsWithScores])

  // ── Client-side filtering ──────────────────────────────────────────────────
  useEffect(() => {
    let result = [...allJobs]

    // Tab: recommended = only jobs with score > 0
    if (activeTab === 'recommended') {
      result = result.filter(j => j.matchScore > 0)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      )
    }
    if (filterType) result = result.filter(j => j.type === filterType)
    if (filterSkill) {
      const sk = filterSkill.toLowerCase()
      result = result.filter(j => j.skillsRequired?.some(s => s.toLowerCase().includes(sk)))
    }

    setFiltered(result)
  }, [allJobs, search, filterType, filterSkill, activeTab])

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = async (job) => {
    setApplying(true)
    try {
      const res = await api.post('/applications/apply', { jobId: job._id, coverLetter })
      setAppliedIds(prev => new Set([...prev, job._id]))
      setToast({ message: `Applied! AI Match Score: ${res.data.matchScore}%`, type: 'success' })
      setSelectedJob(null)
      setCoverLetter('')
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Application failed', type: 'error' })
    } finally {
      setApplying(false)
    }
  }

  const types = ['Full-time', 'Part-time', 'Internship', 'Contract']
  const hasSkills = (user?.skills?.length || 0) > 0

  // ── Find selected job score ────────────────────────────────────────────────
  const selectedJobScore = selectedJob
    ? (allJobs.find(j => j._id === selectedJob._id)?.matchScore ?? 0)
    : 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-title">Browse Jobs</h1>
          <p className="text-surface-400 text-sm mt-1">
            {allJobs.length} jobs available
            {hasSkills && ` · AI scoring based on your ${user.skills.length} skills`}
          </p>
        </div>
        {scoreLoading && (
          <div className="flex items-center gap-2 text-xs text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-full border border-primary-500/20">
            <Zap className="w-3 h-3 animate-pulse" />
            Calculating AI match scores…
          </div>
        )}
      </div>

      {/* No skills warning */}
      {!hasSkills && (
        <div className="card p-4 flex items-start gap-3 border border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-surface-200">Add skills to see AI match scores</p>
            <p className="text-xs text-surface-500 mt-0.5">
              Go to <a href="/student/profile" className="text-primary-400 hover:underline">your profile</a> and add your skills — we'll instantly score every job against your profile.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-800/60 rounded-xl w-fit">
        {[
          { key: 'all', label: 'All Jobs', icon: Briefcase },
          { key: 'recommended', label: 'Best Matches', icon: TrendingUp },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-surface-400 hover:text-surface-200'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
            {key === 'recommended' && hasSkills && (
              <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">
                {allJobs.filter(j => j.matchScore >= 50).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input className="input pl-10" placeholder="Search jobs, companies, descriptions…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <input className="input w-44 hidden sm:block" placeholder="Filter by skill…"
            value={filterSkill} onChange={e => setFilterSkill(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilterType('')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${!filterType ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-surface-800 text-surface-400 border-white/10 hover:border-white/20'}`}>
            All Types
          </button>
          {types.map(t => (
            <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${filterType === t ? 'bg-primary-500/20 text-primary-400 border-primary-500/30' : 'bg-surface-800 text-surface-400 border-white/10 hover:border-white/20'}`}>
              {t}
            </button>
          ))}
          {(search || filterType || filterSkill) && (
            <button onClick={() => { setSearch(''); setFilterType(''); setFilterSkill('') }}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 bg-red-500/10 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-64 animate-pulse bg-surface-800/30" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-surface-700 mx-auto mb-3" />
          <p className="text-surface-400 text-sm">
            {activeTab === 'recommended' ? 'No strong matches yet — add more skills to your profile!' : 'No jobs found matching your criteria'}
          </p>
          {(search || filterType || filterSkill) && (
            <button onClick={() => { setSearch(''); setFilterType(''); setFilterSkill('') }}
              className="btn-secondary text-sm mt-4">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(job => (
            <JobCard
              key={job._id}
              job={job}
              matchScore={hasSkills ? job.matchScore : undefined}
              applied={appliedIds.has(job._id)}
              onView={() => setSelectedJob(job)}
              onApply={() => setSelectedJob(job)}
            />
          ))}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <Modal open={!!selectedJob} onClose={() => { setSelectedJob(null); setCoverLetter('') }}
          title={selectedJob.title} size="lg">
          <div className="space-y-5">
            {/* Job header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-primary-400 font-semibold text-lg">{selectedJob.company}</p>
                <div className="flex items-center gap-3 text-sm text-surface-400 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{selectedJob.type}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedJob.experience}</span>
                </div>
              </div>
              {/* AI match score for this job */}
              {hasSkills && (
                <div className="flex flex-col items-end gap-1">
                  <MatchScoreBadge score={selectedJobScore} size="lg" />
                </div>
              )}
            </div>

            {/* Skill match breakdown */}
            {hasSkills && selectedJob.skillsRequired?.length > 0 && (
              <div className="p-4 rounded-xl bg-surface-800/50 space-y-3">
                <p className="text-sm font-semibold text-surface-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-400" /> Skill Match Breakdown
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skillsRequired.map(s => {
                    const matched = user.skills.some(us => us.toLowerCase() === s.toLowerCase())
                    const partial = !matched && user.skills.some(us =>
                      us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase())
                    )
                    return (
                      <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        matched  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                        partial  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                   'bg-surface-700/60 text-surface-400 border-surface-600/50'
                      }`}>
                        {matched ? '✓' : partial ? '~' : '✗'} {s}
                      </span>
                    )
                  })}
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
                  <span><span className="text-emerald-400">✓ Green</span> = exact match</span>
                  <span><span className="text-amber-400">~ Yellow</span> = partial match</span>
                  <span><span className="text-surface-400">✗ Grey</span> = missing</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-sm font-semibold text-surface-300 mb-2">About the Role</p>
              <p className="text-sm text-surface-400 leading-relaxed">{selectedJob.description}</p>
            </div>

            {/* Cover letter */}
            {!appliedIds.has(selectedJob._id) && (
              <div>
                <label className="label">Cover Letter <span className="text-surface-500 font-normal">(optional)</span></label>
                <textarea rows={4} className="input resize-none"
                  placeholder="Tell the recruiter why you're a great fit…"
                  value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
              </div>
            )}

            <button
              onClick={() => !appliedIds.has(selectedJob._id) && handleApply(selectedJob)}
              disabled={applying || appliedIds.has(selectedJob._id)}
              className={appliedIds.has(selectedJob._id)
                ? 'btn-secondary w-full justify-center cursor-not-allowed opacity-60'
                : 'btn-primary w-full justify-center py-3'}>
              {applying ? 'Submitting…' : appliedIds.has(selectedJob._id) ? '✓ Already Applied' : 'Submit Application'}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
