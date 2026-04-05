import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import SkillTag from '../../components/SkillTag'
import Toast from '../../components/Toast'
import { Plus, Send, Briefcase } from 'lucide-react'

export default function PostJob() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', company: user?.company || '', description: '', location: 'Remote',
    type: 'Full-time', salaryMin: '', salaryMax: '', experience: '0-1 years', deadline: ''
  })
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) { setSkills(p => [...p, s]); setSkillInput('') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.company || !form.description) {
      setToast({ message: 'Please fill all required fields', type: 'error' }); return
    }
    if (skills.length === 0) {
      setToast({ message: 'Add at least one required skill', type: 'error' }); return
    }
    setLoading(true)
    try {
      await api.post('/jobs', { ...form, skillsRequired: skills, salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0 })
      setToast({ message: 'Job posted successfully!', type: 'success' })
      setTimeout(() => navigate('/recruiter/jobs'), 1500)
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to post job', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const types = ['Full-time', 'Part-time', 'Internship', 'Contract']
  const expOptions = ['0-1 years', '1-2 years', '2-3 years', '3-5 years', '5+ years']

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2"><Briefcase className="w-6 h-6 text-accent-400" />Post a New Job</h1>
        <p className="text-surface-400 text-sm mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-surface-200 text-sm uppercase tracking-wide">Basic Information</h2>
          <div>
            <label className="label">Job Title *</label>
            <input className="input" placeholder="e.g. Senior Full Stack Developer" value={form.title} onChange={set('title')} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Company *</label>
              <input className="input" placeholder="Company name" value={form.company} onChange={set('company')} required />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="Remote / City, Country" value={form.location} onChange={set('location')} />
            </div>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea rows={5} className="input resize-none" placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
              value={form.description} onChange={set('description')} required />
          </div>
        </div>

        {/* Job Details */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-surface-200 text-sm uppercase tracking-wide">Job Details</h2>
          <div>
            <label className="label">Employment Type</label>
            <div className="grid grid-cols-4 gap-2">
              {types.map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({...p, type: t}))}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${form.type === t ? 'bg-accent-500/15 border-accent-500/40 text-accent-400' : 'border-white/10 text-surface-400 hover:border-white/20'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Experience Required</label>
              <select className="input" value={form.experience} onChange={set('experience')}>
                {expOptions.map(o => <option key={o} value={o} className="bg-surface-900">{o}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Application Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Min Salary (Annual $)</label>
              <input type="number" className="input" placeholder="80000" value={form.salaryMin} onChange={set('salaryMin')} />
            </div>
            <div>
              <label className="label">Max Salary (Annual $)</label>
              <input type="number" className="input" placeholder="120000" value={form.salaryMax} onChange={set('salaryMax')} />
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-surface-200 text-sm uppercase tracking-wide">Required Skills *</h2>
          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Add required skill..." value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} />
            <button type="button" onClick={addSkill} className="btn-secondary px-4 flex-shrink-0"><Plus className="w-4 h-4" />Add</button>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
            {skills.length === 0 && <p className="text-sm text-surface-600">No skills added. These are used for AI matching.</p>}
            {skills.map(s => <SkillTag key={s} skill={s} variant="accent" onRemove={sk => setSkills(p => p.filter(x => x !== sk))} />)}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
          {loading ? 'Posting Job...' : 'Post Job'}
          {!loading && <Send className="w-4 h-4" />}
        </button>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
