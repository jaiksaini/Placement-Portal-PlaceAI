const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail, verificationEmailHTML, resetPasswordEmailHTML } = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── REGISTER ─────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password, role, company, designation } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });

  if (await User.findOne({ email }))
    return res.status(400).json({ success: false, message: 'Email already registered' });

  const allowedRoles = ['student', 'recruiter'];
  const userRole = allowedRoles.includes(role) ? role : 'student';

  const user = new User({ name, email, password, role: userRole, company: company || '', designation: designation || '' });

  // Generate verification token
  const rawToken = user.generateVerificationToken();
  await user.save();

  // Send verification email
  const verifyUrl = `${CLIENT_URL}/verify-email/${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your PlaceAI account',
      html: verificationEmailHTML(user.name, verifyUrl),
    });
  } catch (emailErr) {
    console.error('Email send failed:', emailErr.message);
    // Don't block registration if email fails
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    requiresVerification: true,
    email: user.email,
  });
});

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ success: false, message: 'Verification link is invalid or has expired.' });

  user.isEmailVerified          = true;
  user.emailVerificationToken   = null;
  user.emailVerificationExpires = null;
  await user.save();

  const token = generateToken(user._id);
  res.json({
    success: true,
    message: 'Email verified successfully! You are now logged in.',
    token,
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, skills: user.skills, company: user.company,
      isEmailVerified: true,
    },
  });
});

// ─── RESEND VERIFICATION ──────────────────────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({ success: false, message: 'No account found with this email.' });

  if (user.isEmailVerified)
    return res.status(400).json({ success: false, message: 'Email is already verified.' });

  const rawToken = user.generateVerificationToken();
  await user.save();

  const verifyUrl = `${CLIENT_URL}/verify-email/${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your PlaceAI account',
      html: verificationEmailHTML(user.name, verifyUrl),
    });
  } catch (emailErr) {
    console.error('Resend email failed:', emailErr.message);
    return res.status(500).json({ success: false, message: 'Failed to send email. Please try again shortly.' });
  }

  res.json({ success: true, message: 'Verification email resent. Please check your inbox.' });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Please provide email and password' });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  if (!user.isActive)
    return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });

  if (!user.isEmailVerified)
    return res.status(403).json({
      success: false,
      message: 'Please verify your email before logging in.',
      requiresVerification: true,
      email: user.email,
    });

  res.json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id),
    user: {
      _id: user._id, name: user.name, email: user.email,
      role: user.role, skills: user.skills, resumeUrl: user.resumeUrl,
      company: user.company, designation: user.designation,
      bio: user.bio, phone: user.phone,
      education: user.education, projects: user.projects,
      isEmailVerified: user.isEmailVerified,
      profilePicture: user.profilePicture,
    },
  });
});

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always return success to prevent email enumeration
  if (!user)
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

  const rawToken = user.generatePasswordResetToken();
  await user.save();

  const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your PlaceAI password',
      html: resetPasswordEmailHTML(user.name, resetUrl),
    });
  } catch (err) {
    user.passwordResetToken   = null;
    user.passwordResetExpires = null;
    await user.save();
    return res.status(500).json({ success: false, message: 'Email could not be sent. Try again.' });
  }

  res.json({ success: true, message: 'Password reset link sent to your email.' });
});

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });

  user.password           = password;
  user.passwordResetToken   = null;
  user.passwordResetExpires = null;
  await user.save();

  res.json({ success: true, message: 'Password reset successful! You can now log in.' });
});

// ─── GET ME ───────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

module.exports = router;
