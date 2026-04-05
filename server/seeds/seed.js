const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job  = require('../models/Job');
const Application = require('../models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placement_portal';

async function seed() {
  const conn = await mongoose.connect(MONGO_URI);
console.log(`Connected to: ${conn.connection.host}`);

  await User.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});

  // All seed users are pre-verified so demo login works immediately
  const admin = await User.create({
    name: 'Admin User', email: 'admin@portal.com', password: 'admin123',
    role: 'admin', isEmailVerified: true, skills: ['Management', 'Analytics']
  });

  const rec1 = await User.create({
    name: 'Sarah Johnson', email: 'recruiter@google.com', password: 'recruiter123',
    role: 'recruiter', isEmailVerified: true,
    company: 'Google', designation: 'Senior HR Manager', skills: ['Recruiting', 'HR']
  });

  const rec2 = await User.create({
    name: 'Mike Chen', email: 'recruiter@microsoft.com', password: 'recruiter123',
    role: 'recruiter', isEmailVerified: true,
    company: 'Microsoft', designation: 'Talent Acquisition Lead', skills: ['Recruiting', 'Technical Hiring']
  });

  const stu1 = await User.create({
    name: 'Alice Smith', email: 'alice@student.com', password: 'student123',
    role: 'student', isEmailVerified: true,
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript'],
    bio: 'Full-stack developer passionate about building scalable web apps',
    phone: '+1-234-567-8901',
    education: [{ institution: 'MIT', degree: 'B.Tech', field: 'Computer Science', year: '2024' }],
    projects: [{ title: 'E-commerce Platform', description: 'Full-stack MERN app', techStack: ['React', 'Node.js', 'MongoDB'], link: 'github.com/alice/ecommerce' }]
  });

  const stu2 = await User.create({
    name: 'Bob Williams', email: 'bob@student.com', password: 'student123',
    role: 'student', isEmailVerified: true,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science', 'SQL'],
    bio: 'ML engineer interested in NLP and computer vision',
    education: [{ institution: 'Stanford', degree: 'M.Tech', field: 'AI/ML', year: '2024' }]
  });

  const stu3 = await User.create({
    name: 'Carol Davis', email: 'carol@student.com', password: 'student123',
    role: 'student', isEmailVerified: true,
    skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'AWS'],
    bio: 'Backend developer with cloud expertise',
    education: [{ institution: 'IIT Delhi', degree: 'B.Tech', field: 'Software Engineering', year: '2024' }]
  });

  const stu4 = await User.create({
    name: 'David Lee', email: 'david@student.com', password: 'student123',
    role: 'student', isEmailVerified: true,
    skills: ['React', 'Vue.js', 'CSS', 'Figma', 'JavaScript'],
    bio: 'Frontend developer with a strong eye for design',
    education: [{ institution: 'UCLA', degree: 'B.Sc', field: 'Computer Science', year: '2024' }]
  });

  const job1 = await Job.create({
    title: 'Full Stack Developer', company: 'Google',
    description: 'Build and maintain scalable web applications. Work with React, Node.js, and cloud infrastructure.',
    location: 'Mountain View, CA', type: 'Full-time',
    skillsRequired: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Docker'],
    salaryMin: 120000, salaryMax: 180000, experience: '0-2 years',
    recruiter: rec1._id, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  const job2 = await Job.create({
    title: 'Machine Learning Engineer', company: 'Microsoft',
    description: 'Design and implement ML models for production systems. Work on NLP, CV, and recommendation systems.',
    location: 'Seattle, WA', type: 'Full-time',
    skillsRequired: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL'],
    salaryMin: 130000, salaryMax: 200000, experience: '1-3 years',
    recruiter: rec2._id, deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  });

  const job3 = await Job.create({
    title: 'Frontend Engineer', company: 'Google',
    description: 'Create stunning and performant user interfaces. Work closely with design and product teams.',
    location: 'Remote', type: 'Full-time',
    skillsRequired: ['React', 'JavaScript', 'CSS', 'TypeScript', 'Figma'],
    salaryMin: 100000, salaryMax: 150000, experience: '0-2 years',
    recruiter: rec1._id, deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  });

  const job4 = await Job.create({
    title: 'Backend Developer Intern', company: 'Microsoft',
    description: 'Develop and maintain REST APIs using Java Spring Boot and cloud services.',
    location: 'Redmond, WA', type: 'Internship',
    skillsRequired: ['Java', 'Spring Boot', 'SQL', 'AWS'],
    salaryMin: 40000, salaryMax: 60000, experience: '0-1 years', recruiter: rec2._id
  });

  const job5 = await Job.create({
    title: 'DevOps Engineer', company: 'Google',
    description: 'Build and manage CI/CD pipelines. Work with Kubernetes, Docker, and cloud infra at massive scale.',
    location: 'Hybrid', type: 'Full-time',
    skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Python'],
    salaryMin: 110000, salaryMax: 160000, experience: '1-3 years', recruiter: rec1._id
  });

  await Application.create({ student: stu1._id, job: job1._id, matchScore: 80, status: 'reviewing', coverLetter: 'I am excited to apply...' });
  await Application.create({ student: stu1._id, job: job3._id, matchScore: 75, status: 'applied' });
  await Application.create({ student: stu2._id, job: job2._id, matchScore: 90, status: 'shortlisted' });
  await Application.create({ student: stu3._id, job: job4._id, matchScore: 85, status: 'hired' });
  await Application.create({ student: stu4._id, job: job3._id, matchScore: 70, status: 'applied' });
  await Application.create({ student: stu4._id, job: job1._id, matchScore: 40, status: 'rejected' });

  await Job.findByIdAndUpdate(job1._id, { applicationsCount: 2 });
  await Job.findByIdAndUpdate(job2._id, { applicationsCount: 1 });
  await Job.findByIdAndUpdate(job3._id, { applicationsCount: 2 });
  await Job.findByIdAndUpdate(job4._id, { applicationsCount: 1 });

  console.log('\n✅ Seed complete!');
  console.log('👤 Admin:     admin@portal.com     / admin123');
  console.log('🏢 Recruiter: recruiter@google.com  / recruiter123');
  console.log('🎓 Student:   alice@student.com     / student123\n');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1) });
