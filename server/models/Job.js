const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  location: { type: String, default: 'Remote' },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
  skillsRequired: [{ type: String, trim: true }],
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  experience: { type: String, default: '0-1 years' },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  applicationsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
