import React from 'react'
import { MapPin, Clock, DollarSign, Briefcase, Users, ChevronRight } from 'lucide-react'
import SkillTag from './SkillTag'
import MatchScoreBadge from './MatchScoreBadge'

export default function JobCard({ job, matchScore, onApply, onView, applied = false, actionLabel = 'Apply Now' }) {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive'
    if (min && max) return `$${(min/1000).toFixed(0)}k – $${(max/1000).toFixed(0)}k`
    if (min) return `$${(min/1000).toFixed(0)}k+`
    return 'Competitive'
  }
  const typeColors = {
    'Full-time': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Internship': 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    'Part-time': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Contract': 'bg-primary-500/15 text-primary-400 border-primary-500/30',
  }
  const daysLeft = job.deadline ? Math.ceil((new Date(job.deadline) - new Date()) / (1000*60*60*24)) : null

  return (
    <div className="card-hover p-5 group cursor-pointer" onClick={onView}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge border ${typeColors[job.type] || typeColors['Full-time']}`}>{job.type}</span>
            {daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 && (
              <span className="badge bg-red-500/15 text-red-400 border border-red-500/30">
                {daysLeft === 0 ? 'Last day!' : `${daysLeft}d left`}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-surface-50 group-hover:text-primary-400 transition-colors truncate">{job.title}</h3>
          <p className="text-sm text-surface-400 font-medium">{job.company}</p>
        </div>
        {matchScore !== undefined && <MatchScoreBadge score={matchScore} />}
      </div>
      <p className="text-sm text-surface-500 line-clamp-2 mb-3">{job.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500 mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || 'Remote'}</span>
        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.experience || 'Any'}</span>
        {job.applicationsCount > 0 && (
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{job.applicationsCount} applicants</span>
        )}
      </div>
      {job.skillsRequired?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skillsRequired.slice(0, 5).map(s => <SkillTag key={s} skill={s} />)}
          {job.skillsRequired.length > 5 && (
            <span className="text-xs text-surface-500 self-center">+{job.skillsRequired.length - 5} more</span>
          )}
        </div>
      )}
      {onApply && (
        <button
          onClick={(e) => { e.stopPropagation(); onApply(job) }}
          disabled={applied}
          className={applied ? 'btn-secondary opacity-60 cursor-not-allowed w-full justify-center text-sm py-2' : 'btn-primary w-full justify-center text-sm py-2'}
        >
          {applied ? '✓ Applied' : actionLabel}
          {!applied && <ChevronRight className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}
