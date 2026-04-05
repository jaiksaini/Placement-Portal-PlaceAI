import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import MatchScoreBadge from '../../components/MatchScoreBadge'
import { Briefcase, FileText, TrendingUp, Zap, ArrowRight, User, ChevronRight, Star } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [applications, setApplications]       = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading]                 = useState(true)
  const [jobsLoading, setJobsLoading]         = useState(true)

  // Load applications
  useEffect(() => {
    api.get('/applications/my')
      .then(res => setApplications(res.data.applications || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Load AI-scored recommended jobs
  useEffect(() => {
    const hasSkills = user?.skills?.length > 0
    if (!hasSkills) {
      api.get('/jobs?limit=4')
        .then(res => setRecommendedJobs((res.data.jobs || []).map(j => ({ ...j, matchScore: 0 }))))
        .catch(console.error)
        .finally(() => setJobsLoading(false))
      return
    }

    api.get('/jobs/recommended')
      .then(res => setRecommendedJobs((res.data.jobs || []).slice(0, 4)))
      .catch(() => {
        // fallback
        api.get('/jobs?limit=4')
          .then(res => setRecommendedJobs((res.data.jobs || []).map(j => ({ ...j, matchScore: 0 }))))
      })
      .finally(() => setJobsLoading(false))
  }, [user?.skills])

  const avgScore   = applications.length
    ? Math.round(applications.reduce((a, b) => a + b.matchScore, 0) / applications.length) : 0
  const statusCount = (s) => applications.filter(a => a.status === s).length
  const hasSkills  = (user?.skills?.length || 0) > 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-surface-50">
            Welcome back, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-surface-400 text-sm mt-1">Here's your placement overview</p>
        </div>
        <Link to="/student/jobs" className="btn-primary text-sm hidden sm:inline-flex">
          Browse Jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Profile completion alert */}
      {(!hasSkills || !user?.resumeUrl) && (
        <div className="card border border-amber-500/30 p-4 flex items-center gap-4 bg-amber-500/5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-surface-200">Complete your profile to unlock AI matching</p>
            <p className="text-xs text-surface-500 mt-0.5">
              {!hasSkills && '• Add your skills to get match scores  '}
              {!user?.resumeUrl && '• Upload your resume'}
            </p>
          </div>
          <Link to="/student/profile" className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={FileText}    label="Applications"   value={applications.length} color="primary" />
        <StatsCard icon={TrendingUp}  label="Shortlisted"    value={statusCount('shortlisted')} color="amber" />
        <StatsCard icon={Zap}         label="Avg AI Score"   value={`${avgScore}%`} color="accent" />
        <StatsCard icon={Briefcase}   label="Hired"          value={statusCount('hired')} color="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recommended Jobs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary-400" />
              <h2 className="font-semibold text-surface-100">
                {hasSkills ? 'AI Recommended Jobs' : 'Latest Jobs'}
              </h2>
            </div>
            <Link to="/student/jobs" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-surface-800/50 rounded-xl animate-pulse" />)}
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 text-surface-700 mx-auto mb-2" />
              <p className="text-surface-500 text-sm">No jobs available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recommendedJobs.map(job => (
                <Link to="/student/jobs" key={job._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 transition-all group">
                  {/* Score circle */}
                  {hasSkills ? (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs font-mono ${
                      job.matchScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                      job.matchScore >= 40 ? 'bg-primary-500/20 text-primary-400' :
                                             'bg-surface-700 text-surface-400'
                    }`}>
                      {job.matchScore}%
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-primary-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-200 truncate group-hover:text-primary-400 transition-colors">
                      {job.title}
                    </p>
                    <p className="text-xs text-surface-500">{job.company} · {job.location}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-surface-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}

          {/* Score legend */}
          {hasSkills && recommendedJobs.length > 0 && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 text-xs text-surface-500">
              <span><span className="text-emerald-400 font-mono">70%+</span> Strong match</span>
              <span><span className="text-primary-400 font-mono">40%+</span> Good match</span>
              <span><span className="text-surface-400 font-mono">&lt;40%</span> Weak match</span>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-100">Recent Applications</h2>
            <Link to="/student/applications" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-surface-800/50 rounded-xl animate-pulse" />)}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-surface-700 mx-auto mb-2" />
              <p className="text-surface-500 text-sm">No applications yet</p>
              <Link to="/student/jobs" className="btn-primary text-xs mt-3 py-1.5 px-3 inline-flex">
                Find Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 5).map(app => (
                <div key={app._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{app.job?.title}</p>
                    <p className="text-xs text-surface-500">{app.job?.company}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <MatchScoreBadge score={app.matchScore} />
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
