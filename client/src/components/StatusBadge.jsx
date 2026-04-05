import React from 'react'
const STATUS_MAP = {
  applied:     { label: 'Applied',     classes: 'bg-surface-700/60 text-surface-300 border-surface-600/50' },
  reviewing:   { label: 'Reviewing',   classes: 'bg-primary-500/15 text-primary-400 border-primary-500/30' },
  shortlisted: { label: 'Shortlisted', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  hired:       { label: 'Hired 🎉',    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
}
export default function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.applied
  return (
    <span className={`badge border ${cfg.classes}`}>{cfg.label}</span>
  )
}
