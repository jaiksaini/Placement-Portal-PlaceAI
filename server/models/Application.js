const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  },
  coverLetter: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

applicationSchema.index({ student: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
