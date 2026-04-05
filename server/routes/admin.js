const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [totalStudents, totalRecruiters, totalJobs, totalApplications] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments()
  ]);

  const statusCounts = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const monthlyApplications = await Application.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ]);

  const topSkills = await User.aggregate([
    { $match: { role: 'student' } },
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const avgMatchScore = await Application.aggregate([
    { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
  ]);

  const recentApplications = await Application.find()
    .populate('student', 'name email')
    .populate('job', 'title company')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    stats: {
      totalStudents, totalRecruiters, totalJobs, totalApplications,
      statusCounts,
      monthlyApplications,
      topSkills,
      avgMatchScore: avgMatchScore[0]?.avgScore?.toFixed(1) || 0,
      recentApplications
    }
  });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, users, total });
});

// PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Application.deleteMany({ student: req.params.id });
  res.json({ success: true, message: 'User deleted' });
});

// GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  const jobs = await Job.find().populate('recruiter', 'name email company').sort({ createdAt: -1 });
  res.json({ success: true, jobs });
});

// DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  await Application.deleteMany({ job: req.params.id });
  res.json({ success: true, message: 'Job deleted' });
});

// GET /api/admin/applications
router.get('/applications', async (req, res) => {
  const applications = await Application.find()
    .populate('student', 'name email skills')
    .populate('job', 'title company')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, applications });
});

module.exports = router;
