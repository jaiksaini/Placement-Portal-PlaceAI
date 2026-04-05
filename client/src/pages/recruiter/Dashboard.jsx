import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import MatchScoreBadge from '../../components/MatchScoreBadge'
import { Briefcase, Users, TrendingUp, Plus, ChevronRight, Zap } from 'lucide-react'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/jobs/recruiter/myjobs').then(res => setJobs(res.data.jobs || [])).catch(console.error).finally(() => setLoading(false))
  }, [])

  const totalApps = jobs.reduce((s, j) => s + (j.applicationsCount || 0), 0)
  const activeJobs = jobs.filter(j => j.isActive).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-surface-50">
            Welcome, <span className="text-accent-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-surface-400 text-sm mt-1">{user?.company || 'Your Company'} · Recruiter Dashboard</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary text-sm">
          <Plus className="w-4 h-4" />Post a Job
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard icon={Briefcase} label="Total Jobs Posted" value={jobs.length} color="accent" />
        <StatsCard icon={Briefcase} label="Active Jobs" value={activeJobs} color="primary" />
        <StatsCard icon={Users} label="Total Applications" value={totalApps} color="emerald" />
      </div>

      {/* Jobs with applicant counts */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-100">Your Job Postings</h2>
          <Link to="/recruiter/jobs" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            Manage all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-surface-800/50 rounded-xl animate-pulse" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10">
            <Briefcase className="w-10 h-10 text-surface-700 mx-auto mb-3" />
            <p className="text-surface-500 text-sm mb-4">No jobs posted yet</p>
            <Link to="/recruiter/post-job" className="btn-primary text-sm inline-flex"><Plus className="w-4 h-4" />Post your first job</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.slice(0, 6).map(job => (
              <Link key={job._id} to={`/recruiter/applicants/${job._id}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-100 group-hover:text-accent-400 transition-colors truncate">{job.title}</p>
                  <p className="text-xs text-surface-500">{job.type} · {job.location}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-base font-bold text-surface-100 font-mono">{job.applicationsCount || 0}</p>
                    <p className="text-xs text-surface-500">applicants</p>
                  </div>
                  <span className={`badge border ${job.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-surface-700 text-surface-400 border-surface-600/50'}`}>
                    {job.isActive ? 'Active' : 'Closed'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-accent-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
