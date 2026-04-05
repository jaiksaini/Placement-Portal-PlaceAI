import React from 'react'
export default function SkillTag({ skill, variant = 'default', onRemove }) {
  const variants = {
    default: 'bg-surface-800 text-surface-300 border-surface-700',
    primary: 'bg-primary-500/15 text-primary-400 border-primary-500/30',
    accent: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${variants[variant]}`}>
      {skill}
      {onRemove && (
        <button onClick={() => onRemove(skill)} className="hover:text-red-400 transition-colors ml-0.5 leading-none">&times;</button>
      )}
    </span>
  )
}
