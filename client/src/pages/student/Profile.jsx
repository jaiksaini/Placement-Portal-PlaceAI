import React, { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import SkillTag from '../../components/SkillTag'
import Toast from '../../components/Toast'
import { User, Upload, Plus, Save, GraduationCap, Code2, FileText, Phone, X } from 'lucide-react'

export default function StudentProfile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '',
    skillInput: '',
    skills: user?.skills || [],
    education: user?.education || [],
    projects: user?.projects || [],
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef()

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}))

  const addSkill = () => {
    const s = form.skillInput.trim()
    if (s && !form.skills.includes(s)) {
      setForm(p => ({...p, skills: [...p.skills, s], skillInput: ''}))
    }
  }

  const removeSkill = (s) => setForm(p => ({...p, skills: p.skills.filter(sk => sk !== s)}))

  const addEducation = () => setForm(p => ({...p, education: [...p.education, { institution: '', degree: '', field: '', year: '' }]}))
  const updateEducation = (i, k, v) => {
    const edu = [...form.education]
    edu[i] = {...edu[i], [k]: v}
    setForm(p => ({...p, education: edu}))
  }
  const removeEducation = (i) => setForm(p => ({...p, education: p.education.filter((_, idx) => idx !== i)}))

  const addProject = () => setForm(p => ({...p, projects: [...p.projects, { title: '', description: '', techStack: [], link: '' }]}))
  const updateProject = (i, k, v) => {
    const proj = [...form.projects]
    proj[i] = {...proj[i], [k]: v}
    setForm(p => ({...p, projects: proj}))
  }
  const removeProject = (i) => setForm(p => ({...p, projects: p.projects.filter((_, idx) => idx !== i)}))

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('resume', file)
    try {
      const res = await api.post('/users/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser({ resumeUrl: res.data.resumeUrl })
      setToast({ message: 'Resume uploaded successfully!', type: 'success' })
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Upload failed', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/users/profile', {
        name: form.name, phone: form.phone, bio: form.bio,
        skills: form.skills, education: form.education, projects: form.projects
      })
      updateUser(res.data.user)
      setToast({ message: 'Profile saved!', type: 'success' })
    } catch (err) {
      setToast({ message: 'Failed to save profile', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const completeness = () => {
    let pts = 0, total = 5
    if (form.name) pts++
    if (form.bio) pts++
    if (form.skills.length) pts++
    if (user?.resumeUrl) pts++
    if (form.education.length) pts++
    return Math.round((pts / total) * 100)
  }
  const pct = completeness()

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="text-surface-400 text-sm mt-1">A complete profile helps you get better AI match scores</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Profile Completion */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-surface-300">Profile Completeness</span>
          <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-surface-800 rounded-full">
          <div className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-surface-100 flex items-center gap-2"><User className="w-4 h-4 text-primary-400" />Basic Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Phone</label><input className="input" placeholder="+1 234 567 8901" value={form.phone} onChange={set('phone')} /></div>
        </div>
        <div><label className="label">Bio</label>
          <textarea rows={3} className="input resize-none" placeholder="Tell recruiters about yourself..."
            value={form.bio} onChange={set('bio')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
          <p className="text-xs text-surface-500 mt-1">Email cannot be changed</p>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-surface-100 flex items-center gap-2"><Code2 className="w-4 h-4 text-primary-400" />Skills</h2>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Add a skill (e.g. React, Python...)"
            value={form.skillInput} onChange={set('skillInput')}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} />
          <button onClick={addSkill} className="btn-primary px-4 py-2.5 text-sm flex-shrink-0"><Plus className="w-4 h-4" />Add</button>
        </div>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
          {form.skills.length === 0 && <p className="text-sm text-surface-600">No skills added yet</p>}
          {form.skills.map(s => <SkillTag key={s} skill={s} variant="primary" onRemove={removeSkill} />)}
        </div>
      </div>

      {/* Resume */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-surface-100 flex items-center gap-2"><FileText className="w-4 h-4 text-primary-400" />Resume</h2>
        {user?.resumeUrl ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Resume uploaded ✓</p>
                <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-surface-400 hover:text-surface-200">View / Download</a>
              </div>
            </div>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary text-xs py-1.5 px-3">Replace</button>
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/40 hover:bg-primary-500/5 transition-all">
            <Upload className="w-8 h-8 text-surface-600 mx-auto mb-2" />
            <p className="text-surface-400 text-sm">{uploading ? 'Uploading...' : 'Click to upload your resume'}</p>
            <p className="text-surface-600 text-xs mt-1">PDF only, max 5MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
      </div>

      {/* Education */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-surface-100 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary-400" />Education</h2>
          <button onClick={addEducation} className="btn-secondary text-xs py-1.5 px-3"><Plus className="w-3 h-3" />Add</button>
        </div>
        {form.education.map((edu, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-800/50 space-y-3 relative">
            <button onClick={() => removeEducation(i)} className="absolute top-3 right-3 text-surface-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="label text-xs">Institution</label><input className="input text-sm py-2" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="MIT" /></div>
              <div><label className="label text-xs">Degree</label><input className="input text-sm py-2" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="B.Tech" /></div>
              <div><label className="label text-xs">Field of Study</label><input className="input text-sm py-2" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} placeholder="Computer Science" /></div>
              <div><label className="label text-xs">Year</label><input className="input text-sm py-2" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} placeholder="2024" /></div>
            </div>
          </div>
        ))}
        {form.education.length === 0 && <p className="text-sm text-surface-600">No education entries yet</p>}
      </div>

      {/* Projects */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-surface-100 flex items-center gap-2"><Code2 className="w-4 h-4 text-primary-400" />Projects</h2>
          <button onClick={addProject} className="btn-secondary text-xs py-1.5 px-3"><Plus className="w-3 h-3" />Add</button>
        </div>
        {form.projects.map((proj, i) => (
          <div key={i} className="p-4 rounded-xl bg-surface-800/50 space-y-3 relative">
            <button onClick={() => removeProject(i)} className="absolute top-3 right-3 text-surface-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
            <div><label className="label text-xs">Project Title</label><input className="input text-sm py-2" value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} placeholder="E-commerce App" /></div>
            <div><label className="label text-xs">Description</label><textarea rows={2} className="input resize-none text-sm py-2" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} placeholder="Brief description..." /></div>
            <div><label className="label text-xs">GitHub / Live Link</label><input className="input text-sm py-2" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} placeholder="https://github.com/..." /></div>
          </div>
        ))}
        {form.projects.length === 0 && <p className="text-sm text-surface-600">No projects added yet</p>}
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full justify-center py-3">
        <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save All Changes'}
      </button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
