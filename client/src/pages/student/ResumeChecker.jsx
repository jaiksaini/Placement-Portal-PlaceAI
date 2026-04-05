import React, { useState } from 'react'
import api from '../../services/api'
import {
  FileSearch, Zap, AlertCircle, CheckCircle, Info,
  ChevronDown, ChevronUp, Lightbulb, BarChart2,
  User, BookOpen, Briefcase, Code2, GraduationCap,
  FolderGit2, AlignLeft, ArrowRight, RefreshCw, ClipboardPaste
} from 'lucide-react'

const SAMPLE_RESUME = `John Doe
john.doe@gmail.com | +1 (555) 123-4567 | linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Results-driven software engineer with 2 years of experience building scalable web applications. Passionate about React, Node.js, and cloud technologies. Responsible for delivering high-quality code.

EDUCATION
B.Tech in Computer Science — MIT | GPA: 3.8/4.0 | 2022

SKILLS
Languages: JavaScript, Python, Java
Frameworks: React, Node.js, Express
Databases: MongoDB, SQL
Tools: Git, Docker

EXPERIENCE
Software Engineer — TechCorp (2022 - Present)
- Helped build REST APIs using Node.js
- Worked on React frontend for dashboard
- Was involved in database optimization tasks

Intern — StartupXYZ (Summer 2021)
- Assisted team with feature development

PROJECTS
E-Commerce Platform (github.com/johndoe/ecommerce)
- Built full-stack app with React and Node.js

To-Do App
- Used HTML, CSS, JavaScript`

const SECTION_ICONS = {
  contact:    User,
  summary:    AlignLeft,
  experience: Briefcase,
  skills:     Code2,
  education:  GraduationCap,
  projects:   FolderGit2,
  formatting: BarChart2,
}

const PRIORITY_CONFIG = {
  critical:  { label: 'Critical',   color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/25',    dot: 'bg-red-400' },
  important: { label: 'Important',  color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25', dot: 'bg-amber-400' },
  nice:      { label: 'Nice-to-Have', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', dot: 'bg-emerald-400' },
}

function ScoreRing({ score, grade, gradeLabel }) {
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dash = circ * (score / 100)

  const color = score >= 80 ? '#10b981' : score >= 65 ? '#0ea5e9' : score >= 50 ? '#f59e0b' : score >= 35 ? '#f97316' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
          <span className="text-sm text-surface-400 font-medium">/ 100</span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="text-2xl font-display font-bold" style={{ color }}>{grade}</span>
        <p className="text-sm text-surface-400 mt-0.5">{gradeLabel}</p>
      </div>
    </div>
  )
}

function SectionCard({ sectionKey, data }) {
  const Icon = SECTION_ICONS[sectionKey] || BookOpen
  const score = data.score
  const color = score >= 75 ? 'emerald' : score >= 50 ? 'primary' : score >= 25 ? 'amber' : 'red'
  const colorMap = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    primary: { bar: 'bg-primary-500', text: 'text-primary-400', bg: 'bg-primary-500/10' },
    amber:   { bar: 'bg-amber-500',   text: 'text-amber-400',   bg: 'bg-amber-500/10'   },
    red:     { bar: 'bg-red-500',     text: 'text-red-400',     bg: 'bg-red-500/10'     },
  }
  const c = colorMap[color]

  return (
    <div className="card p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <span className="text-sm font-medium text-surface-200 flex-1 truncate">{data.label}</span>
        <span className={`text-sm font-bold font-mono ${c.text}`}>{score}</span>
      </div>
      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default function ResumeChecker() {
  const [resumeText, setResumeText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) {
      setError('Please paste at least 50 characters of resume text.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/users/resume-check', { resumeText })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSample = () => {
    setResumeText(SAMPLE_RESUME)
    setResult(null)
    setError('')
  }

  const filteredSuggestions = result?.suggestions?.filter(s =>
    activeFilter === 'all' ? true : s.priority === activeFilter
  ) || []

  const displayed = showAllSuggestions ? filteredSuggestions : filteredSuggestions.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-surface-50 flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-primary-400" />
            AI Resume Checker
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            Get an instant score + prioritized feedback to land more interviews
          </p>
        </div>
        {result && (
          <button onClick={() => { setResult(null); setResumeText('') }}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Check Another
          </button>
        )}
      </div>

      {!result ? (
        /* ─── Input Panel ─── */
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-surface-100">Paste Your Resume Text</h2>
              <button onClick={handleSample}
                className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                <ClipboardPaste className="w-3.5 h-3.5" /> Load Sample
              </button>
            </div>

            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste the plain text of your resume here...&#10;&#10;Tip: Open your resume PDF → Select All (Ctrl+A) → Copy (Ctrl+C) → Paste here"
              className="input resize-none flex-1 min-h-[360px] font-mono text-xs leading-relaxed text-surface-300 bg-surface-900/60"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">
                {resumeText.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || resumeText.trim().length < 50}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</>
              ) : (
                <><Zap className="w-4 h-4" /> Analyze My Resume</>
              )}
            </button>
          </div>

          {/* Tips Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5 border border-primary-500/20 bg-primary-500/5">
              <h3 className="text-sm font-semibold text-primary-400 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> How it works
              </h3>
              <div className="space-y-3">
                {[
                  { n: '1', t: 'Paste your resume text in the box' },
                  { n: '2', t: 'Click "Analyze" — AI scores 7 sections' },
                  { n: '3', t: 'Review your score and prioritized fixes' },
                  { n: '4', t: 'Apply suggestions and re-check to improve' },
                ].map(({ n, t }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary-400">{n}</span>
                    </div>
                    <p className="text-xs text-surface-400 leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">What we check</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: User, label: 'Contact Info' },
                  { icon: AlignLeft, label: 'Summary' },
                  { icon: Briefcase, label: 'Experience' },
                  { icon: Code2, label: 'Skills' },
                  { icon: GraduationCap, label: 'Education' },
                  { icon: FolderGit2, label: 'Projects' },
                  { icon: BarChart2, label: 'Formatting' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-surface-400">
                    <Icon className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs text-amber-400 font-semibold mb-1">💡 Best results tip</p>
              <p className="text-xs text-surface-400 leading-relaxed">
                Copy text directly from your PDF (not screenshots). Include all sections for the most accurate score.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Results Panel ─── */
        <div className="space-y-6">
          {/* Score Header */}
          <div className="card p-6 bg-gradient-to-br from-surface-900 via-surface-900 to-surface-800 border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <ScoreRing
                score={result.overall_score}
                grade={result.grade}
                gradeLabel={result.grade_label}
              />
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-display font-semibold text-surface-50 mb-1">
                  Your Resume Score
                </h2>
                <p className="text-surface-400 text-sm mb-4">
                  Analyzed {result.word_count} words across 7 dimensions
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  {result.critical_count > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-xs font-semibold text-red-400">{result.critical_count} Critical</span>
                    </div>
                  )}
                  {result.important_count > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-xs font-semibold text-amber-400">{result.important_count} Important</span>
                    </div>
                  )}
                  {result.nice_count > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">{result.nice_count} Nice-to-Have</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Section Scores */}
            <div className="lg:col-span-1 space-y-3">
              <h3 className="font-semibold text-surface-200 text-sm">Section Breakdown</h3>
              {Object.entries(result.sections).map(([key, data]) => (
                <SectionCard key={key} sectionKey={key} data={data} />
              ))}
            </div>

            {/* Suggestions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-surface-200 text-sm">Improvement Suggestions</h3>
                {/* Filter tabs */}
                <div className="flex gap-1 bg-surface-900 rounded-lg p-0.5 border border-white/10">
                  {['all', 'critical', 'important', 'nice'].map(f => (
                    <button key={f}
                      onClick={() => { setActiveFilter(f); setShowAllSuggestions(false) }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                        activeFilter === f
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-surface-500 hover:text-surface-300'
                      }`}>
                      {f === 'nice' ? 'Nice-to-have' : f === 'all' ? `All (${result.suggestions.length})` : f}
                    </button>
                  ))}
                </div>
              </div>

              {displayed.length === 0 ? (
                <div className="card p-8 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-surface-300 font-medium">Nothing to fix here!</p>
                  <p className="text-surface-500 text-sm mt-1">No issues found for this filter.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayed.map((s, i) => {
                    const pc = PRIORITY_CONFIG[s.priority]
                    return (
                      <div key={i} className={`card p-4 border flex items-start gap-3 ${pc.bg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${pc.dot}`} />
                        <div className="flex-1">
                          <p className="text-sm text-surface-200 leading-relaxed">{s.text}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 mt-0.5 ${pc.color}`}>
                          {pc.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {filteredSuggestions.length > 5 && (
                <button
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-xs text-surface-400 hover:text-surface-200 hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                >
                  {showAllSuggestions ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> Show {filteredSuggestions.length - 5} more suggestions</>
                  )}
                </button>
              )}

              {/* Issues found */}
              {result.issues?.length > 0 && (
                <div className="card p-4 border border-red-500/15 bg-red-500/5">
                  <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Issues Detected
                  </h4>
                  <ul className="space-y-1">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-surface-400 flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
