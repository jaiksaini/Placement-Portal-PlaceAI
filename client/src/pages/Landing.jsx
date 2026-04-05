import React from 'react'
import { Link } from 'react-router-dom'
import { Zap, GraduationCap, Building2, Shield, ArrowRight, Brain, BarChart3, FileSearch, CheckCircle } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Noise + gradient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-500/6 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold text-surface-50">PlaceAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-medium mb-8">
          <Brain className="w-3.5 h-3.5" />
          AI-Powered Skill Matching Engine
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-semibold text-surface-50 leading-[1.1] max-w-4xl mb-6">
          Smart Placement.<br />
          <em className="not-italic bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            Intelligent Matches.
          </em>
        </h1>

        <p className="text-surface-400 text-lg max-w-xl mb-10 leading-relaxed">
          The AI-powered placement portal that connects students with their ideal roles using intelligent skill analysis and real-time match scoring.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
            Start Free Today <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
            View Demo
          </Link>
        </div>

        {/* Role Cards */}
        <div className="grid sm:grid-cols-3 gap-5 max-w-3xl w-full">
          {[
            {
              icon: GraduationCap, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20',
              title: 'Students', desc: 'Build your profile, upload resume, apply to jobs, and see your AI match score instantly.',
              features: ['AI match scoring', 'Resume upload', 'Application tracking']
            },
            {
              icon: Building2, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20',
              title: 'Recruiters', desc: 'Post jobs, define required skills, and instantly see ranked applicants by AI match score.',
              features: ['Post job listings', 'Skill-based matching', 'Applicant management']
            },
            {
              icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
              title: 'Admins', desc: 'Full platform oversight with analytics, charts, and user management tools.',
              features: ['Analytics dashboard', 'User management', 'Platform insights']
            },
          ].map(({ icon: Icon, color, bg, border, title, desc, features }) => (
            <div key={title} className={`card p-5 text-left border ${border}`}>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-surface-100 mb-2">{title}</h3>
              <p className="text-sm text-surface-500 mb-4 leading-relaxed">{desc}</p>
              <ul className="space-y-1.5">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-surface-400">
                    <CheckCircle className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section className="relative z-10 px-6 py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-semibold text-surface-50 mb-12">How the AI Matching Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { icon: FileSearch, step: '01', title: 'Student adds skills', desc: 'Students list their skills on their profile (React, Python, Docker, etc.)' },
              { icon: Brain, step: '02', title: 'AI analyzes match', desc: 'Our NLP engine compares student skills against job requirements with category-aware scoring.' },
              { icon: BarChart3, step: '03', title: 'Match score returned', desc: 'Both student and recruiter see a transparent match score — e.g. 78% match.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-400" />
                </div>
                <p className="text-xs font-mono text-primary-500 mb-1">{step}</p>
                <h3 className="font-semibold text-surface-100 mb-2">{title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-surface-800/50 border border-white/10 font-mono text-sm text-left max-w-lg mx-auto">
            <p className="text-surface-500 mb-1">// Example AI match</p>
            <p className="text-surface-400">Student skills: <span className="text-primary-400">["React", "Node.js"]</span></p>
            <p className="text-surface-400">Job requires: <span className="text-accent-400">["React", "Node.js", "MongoDB"]</span></p>
            <p className="text-emerald-400 mt-1">→ Match Score: <span className="font-bold">66%</span></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 border-t border-white/10 flex items-center justify-between text-xs text-surface-600">
        <span>© 2024 PlaceAI — AI-Powered Placement Portal</span>
        <span>Built with React · Node.js · Python Flask · MongoDB</span>
      </footer>
    </div>
  )
}
