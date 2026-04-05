const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.user._id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
  }
});

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const { name, phone, bio, skills, education, projects, company, designation } = req.body;
  const updateData = {};
  if (name) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (bio !== undefined) updateData.bio = bio;
  if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean);
  if (education) updateData.education = education;
  if (projects) updateData.projects = projects;
  if (company !== undefined) updateData.company = company;
  if (designation !== undefined) updateData.designation = designation;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select('-password');
  res.json({ success: true, message: 'Profile updated', user });
});

// POST /api/users/upload-resume
router.post('/upload-resume', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const resumeUrl = `/uploads/resumes/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { resumeUrl }, { new: true }).select('-password');
  res.json({ success: true, message: 'Resume uploaded successfully', resumeUrl, user });
});

// PUT /api/users/change-password
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

// POST /api/users/resume-check — proxy to AI service
router.post('/resume-check', protect, async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ success: false, message: 'Please provide at least 50 characters of resume text.' });
  }
  try {
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/analyze-resume`,
      { resume_text: resumeText },
      { timeout: 10000 }
    );
    res.json({ success: true, ...aiRes.data });
  } catch (err) {
    console.error('Resume check AI error:', err.message);
    res.status(503).json({ success: false, message: 'AI service is unavailable. Please try again shortly.' });
  }
});

module.exports = router;
