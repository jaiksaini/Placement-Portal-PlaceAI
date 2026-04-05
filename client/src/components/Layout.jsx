import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, User, Briefcase, FileText, Plus,
  Users, Settings, LogOut, Menu, X, ChevronRight,
  GraduationCap, Building2, Shield, Bell, FileSearch
} from 'lucide-react'

const navConfig = {
  student: [
    { to: '/student/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/jobs',         icon: Briefcase,       label: 'Browse Jobs' },
    { to: '/student/applications', icon: FileText,        label: 'My Applications' },
    { to: '/student/resume-check', icon: FileSearch,      label: 'Resume Checker' },
    { to: '/student/profile',      icon: User,            label: 'Profile' },
  ],
  recruiter: [
    { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/recruiter/post-job', icon: Plus, label: 'Post a Job' },
    { to: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/admin/jobs', icon: Briefcase, label: 'Manage Jobs' },
  ]
}

const roleConfig = {
  student: { icon: GraduationCap, color: 'text-primary-400', bg: 'bg-primary-500/20', label: 'Student' },
  recruiter: { icon: Building2, color: 'text-accent-400', bg: 'bg-accent-500/20', label: 'Recruiter' },
  admin: { icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Admin' },
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = navConfig[user?.role] || []
  const role = roleConfig[user?.role] || roleConfig.student
  const RoleIcon = role.icon

  const handleLogout = () => { logout(); navigate('/') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <p className="font-display font-semibold text-surface-50 leading-tight">PlaceAI</p>
            <p className="text-xs text-surface-500">Smart Placement Portal</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center flex-shrink-0`}>
            <RoleIcon className={`w-5 h-5 ${role.color}`} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-surface-100 truncate">{user?.name}</p>
            <p className={`text-xs font-medium ${role.color}`}>{role.label}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 glass-dark border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 glass-dark border-r border-white/10 z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 glass-dark border-b border-white/10 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-surface-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="lg:hidden font-display font-semibold text-surface-50">PlaceAI</div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="p-2 rounded-lg hover:bg-white/10 text-surface-400 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-surface-400">
              <span>Hi, <span className="text-surface-200 font-medium">{user?.name?.split(' ')[0]}</span></span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
