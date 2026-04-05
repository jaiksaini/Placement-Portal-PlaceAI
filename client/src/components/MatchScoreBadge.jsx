import React from 'react'
import { Zap } from 'lucide-react'

export default function MatchScoreBadge({ score, size = 'md', showLabel = true }) {
  const getColor = (s) => {
    if (s >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', bar: 'bg-emerald-500' }
    if (s >= 60) return { text: 'text-primary-400', bg: 'bg-primary-500/15', border: 'border-primary-500/30', bar: 'bg-primary-500' }
    if (s >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', bar: 'bg-amber-500' }
    return { text: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30', bar: 'bg-red-500' }
  }
  const c = getColor(score)
  if (size === 'lg') return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-2">
        <Zap className={`w-5 h-5 ${c.text}`} />
        <span className={`text-3xl font-bold font-mono ${c.text}`}>{score}%</span>
      </div>
      {showLabel && <p className="text-xs text-surface-400 font-medium">AI Match Score</p>}
      <div className="w-full h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div className={`h-full ${c.bar} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}>
      <Zap className="w-3 h-3" />{score}% match
    </span>
  )
}
