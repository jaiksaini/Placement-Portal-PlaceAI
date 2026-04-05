const express = require('express');
const router = express.Router();
const axios = require('axios');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Helper: compute match score
async function computeMatchScore(studentSkills, jobSkills) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/match`, {
      student_skills: studentSkills,
      job_skills: jobSkills
    }, { timeout: 5000 });
    return response.data.match_score || 0;
  } catch (err) {
    // Fallback: simple intersection-based matching
    if (!studentSkills.length || !jobSkills.length) return 0;
    const normStudent = studentSkills.map(s => s.toLowerCase().trim());
    const normJob = jobSkills.map(s => s.toLowerCase().trim());
    const matches = normStudent.filter(s => normJob.some(j => j.includes(s) || s.includes(j)));
    return Math.round((matches.length / normJob.length) * 100);
  }
}

// POST /api/applications/apply
router.post('/apply', protect, authorize('student'), async (req, res) => {
  const { jobId, coverLetter } = req.body;
  if (!jobId) return res.status(400).json({ success: false, message: 'Job ID is required' });

  const job = await Job.findById(jobId);
  if (!job || !job.isActive) {
    return res.status(404).json({ success: false, message: 'Job not found or inactive' });
  }

  const existing = await Application.findOne({ student: req.user._id, job: jobId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Already applied to this job' });
  }

  const student = await User.findById(req.user._id);
  const matchScore = await computeMatchScore(student.skills, job.skillsRequired);

  const application = await Application.create({
    student: req.user._id,
    job: jobId,
    matchScore,
    coverLetter: coverLetter || ''
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  const populated = await Application.findById(application._id)
    .populate('job', 'title company location type skillsRequired');

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    application: populated,
    matchScore
  });
});

// GET /api/applications/my - Student's applications
router.get('/my', protect, authorize('student'), async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .populate('job', 'title company location type skillsRequired salaryMin salaryMax experience deadline')
    .sort({ createdAt: -1 });

  res.json({ success: true, applications });
});

// GET /api/applications/:id
router.get('/:id', protect, async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('student', 'name email skills resumeUrl education')
    .populate('job', 'title company skillsRequired');

  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, application });
});

// PUT /api/applications/:id/status - Update application status (recruiter/admin)
router.put('/:id/status', protect, authorize('recruiter', 'admin'), async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status, notes: notes || '' },
    { new: true }
  ).populate('student', 'name email').populate('job', 'title company');

  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, message: 'Status updated', application });
});

// DELETE /api/applications/:id/withdraw - Student withdraws application
router.delete('/:id/withdraw', protect, authorize('student'), async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, student: req.user._id });
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  await Application.findByIdAndDelete(req.params.id);
  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
  res.json({ success: true, message: 'Application withdrawn' });
});

module.exports = router;
