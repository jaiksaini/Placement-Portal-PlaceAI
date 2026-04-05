import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import StatsCard from '../../components/StatsCard'
import StatusBadge from '../../components/StatusBadge'
import MatchScoreBadge from '../../components/MatchScoreBadge'
import { Users, Briefcase, FileText, TrendingUp, Zap, GraduationCap, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#0ea5e9','#d946ef','#10b981','#f59e0b','#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data.stats)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-surface-800/50 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="card p-5 h-24 animate-pulse bg-surface-800/30" />)}
      </div>
    </div>
  )

  const statusData = stats?.statusCounts?.map(s => ({ name: s._id, value: s.count })) || []
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const monthlyData = stats?.monthlyApplications?.map(m => ({
    name: monthNames[m._id.month - 1], applications: m.count
  })) || []
  const skillsData = stats?.topSkills?.slice(0,8).map(s => ({ skill: s._id, count: s.count })) || []

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) return (
      <div className="card px-3 py-2 text-xs border border-white/10">
        <p className="text-surface-300 font-medium">{label}</p>
        {payload.map((p, i) => <p key={i} style={{color: p.color}}>{p.name}: {p.value}</p>)}
      </div>
    )
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Admin Dashboard</h1>
        <p className="text-surface-400 text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={GraduationCap} label="Total Students" value={stats?.totalStudents || 0} color="primary" />
        <StatsCard icon={Building2} label="Recruiters" value={stats?.totalRecruiters || 0} color="accent" />
        <StatsCard icon={Briefcase} label="Active Jobs" value={stats?.totalJobs || 0} color="emerald" />
        <StatsCard icon={FileText} label="Applications" value={stats?.totalApplications || 0} color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Applications Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-surface-100 mb-4">Monthly Applications</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="applications" fill="url(#barGrad)" radius={[6,6,0,0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-surface-500 text-sm">No data available</div>
          )}
        </div>

        {/* Application Status Pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-surface-100 mb-4">Application Status</h2>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-surface-400 capitalize">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                      {item.name}
                    </span>
                    <span className="font-mono text-surface-300">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-[200px] flex items-center justify-center text-surface-500 text-sm">No data</div>}
        </div>
      </div>

      {/* Top Skills */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-100">Most Common Student Skills</h2>
          <span className="text-xs text-surface-500">Top 8</span>
        </div>
        {skillsData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={skillsData} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="url(#skillGrad)" radius={[0,6,6,0]} />
              <defs>
                <linearGradient id="skillGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d946ef" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#d946ef" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="h-40 flex items-center justify-center text-surface-500 text-sm">No skill data</div>}
      </div>

      {/* Recent Applications */}
      <div className="card p-5">
        <h2 className="font-semibold text-surface-100 mb-4">Recent Applications</h2>
        <div className="space-y-3">
          {stats?.recentApplications?.map(app => (
            <div key={app._id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-200">{app.student?.name}</p>
                <p className="text-xs text-surface-500">Applied for <span className="text-surface-400">{app.job?.title}</span> at {app.job?.company}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>
      </div>

      {/* AI Stat */}
      <div className="card p-5 border border-primary-500/20 bg-primary-500/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-surface-400">Average AI Match Score across all applications</p>
            <p className="text-3xl font-bold text-primary-400 font-mono">{stats?.avgMatchScore || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
