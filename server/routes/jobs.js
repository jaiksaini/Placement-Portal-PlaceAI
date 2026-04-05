const express = require('express');
const router = express.Router();
const axios = require('axios');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/jobs - Get all active jobs (public)
router.get('/', async (req, res) => {
  const { search, skills, type, location, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (skills) {
    const skillArr = skills.split(',').map(s => s.trim());
    query.skillsRequired = { $in: skillArr.map(s => new RegExp(s, 'i')) };
  }
  if (type) query.type = type;
  if (location) query.location = { $regex: location, $options: 'i' };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('recruiter', 'name email company')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// GET /api/jobs/recruiter/myjobs - Recruiter's jobs
router.get('/recruiter/myjobs', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, jobs });
});

// ─── GET /api/jobs/recommended ────────────────────────────────────────────────
// Returns all active jobs with AI match scores for the logged-in student
router.get('/recommended', protect, authorize('student'), async (req, res) => {
  const student = await User.findById(req.user._id);
  const jobs    = await Job.find({ isActive: true })
    .populate('recruiter', 'name company')
    .sort({ createdAt: -1 });

  if (!student.skills || student.skills.length === 0) {
    // No skills yet — return jobs with 0 score
    return res.json({
      success: true,
      jobs: jobs.map(j => ({ ...j.toObject(), matchScore: 0 })),
    });
  }

  // Call AI service bulk-match
  try {
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/bulk-match`,
      {
        student_skills: student.skills,
        jobs: jobs.map(j => ({ id: j._id.toString(), skills: j.skillsRequired })),
      },
      { timeout: 8000 }
    );

    // Map scores back onto jobs
    const scoreMap = {};
    (aiRes.data.results || []).forEach(r => { scoreMap[r.job_id] = r.match_score; });

    const jobsWithScores = jobs.map(j => ({
      ...j.toObject(),
      matchScore: scoreMap[j._id.toString()] ?? 0,
    }));

    // Sort: highest score first
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    return res.json({ success: true, jobs: jobsWithScores });

  } catch (aiErr) {
    // AI service down — fallback: simple intersection scoring
    const normStudent = student.skills.map(s => s.toLowerCase().trim());
    const jobsWithScores = jobs.map(j => {
      const normJob = (j.skillsRequired || []).map(s => s.toLowerCase().trim());
      if (!normJob.length) return { ...j.toObject(), matchScore: 0 };
      const matched = normStudent.filter(s => normJob.some(js => js.includes(s) || s.includes(js)));
      const score   = Math.round((matched.length / normJob.length) * 100);
      return { ...j.toObject(), matchScore: score };
    });
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
    return res.json({ success: true, jobs: jobsWithScores });
  }
});


// GET /api/jobs/:id/applicants - Get applicants for a job
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const applications = await Application.find({ job: req.params.id })
    .populate('student', 'name email skills resumeUrl education bio phone')
    .sort({ matchScore: -1 });

  res.json({ success: true, applications });
});


// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  const job = await Job.findById(req.params.id).populate('recruiter', 'name email company designation');
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, job });
});

// POST /api/jobs - Create job (recruiter only)
router.post('/', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const { title, company, description, location, type, skillsRequired, salaryMin, salaryMax, experience, deadline } = req.body;
  if (!title || !company || !description) {
    return res.status(400).json({ success: false, message: 'Title, company and description are required' });
  }

  const job = await Job.create({
    title, company, description, location, type,
    skillsRequired: skillsRequired || [],
    salaryMin, salaryMax, experience, deadline,
    recruiter: req.user._id
  });

  res.status(201).json({ success: true, message: 'Job posted successfully', job });
});

// PUT /api/jobs/:id - Update job
router.put('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
  }

  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, message: 'Job updated', job: updated });
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await Job.findByIdAndDelete(req.params.id);
  await Application.deleteMany({ job: req.params.id });
  res.json({ success: true, message: 'Job deleted successfully' });
});


module.exports = router;
