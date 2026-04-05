const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  role:       { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },

  // Email verification
  isEmailVerified:          { type: Boolean, default: false },
  emailVerificationToken:   { type: String, default: null },
  emailVerificationExpires: { type: Date, default: null },

  // Password reset
  passwordResetToken:   { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },

  // Profile fields
  skills:    [{ type: String, trim: true }],
  resumeUrl: { type: String, default: null },
  phone:     { type: String, default: '' },
  bio:       { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  education: [{
    institution: String,
    degree: String,
    field: String,
    year: String
  }],
  projects: [{
    title: String,
    description: String,
    techStack: [String],
    link: String
  }],
  company:     { type: String, default: '' },
  designation: { type: String, default: '' },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token; // return raw token (sent in email)
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
