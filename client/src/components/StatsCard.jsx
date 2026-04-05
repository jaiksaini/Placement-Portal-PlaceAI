import React from 'react'
export default function StatsCard({ icon: Icon, label, value, sub, color = 'primary', trend }) {
  const colors = {
    primary: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/20' },
    accent: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/20' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
  }
  const c = colors[color] || colors.primary
  return (
    <div className={`card p-5 border ${c.border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-surface-50 font-mono">{value}</p>
          {sub && <p className="text-xs text-surface-500 mt-1">{sub}</p>}
          {trend && <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
    </div>
  )
}
