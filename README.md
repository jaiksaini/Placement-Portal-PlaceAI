<div align="center">

# ⚡ PlaceAI

### AI-Powered Placement Management Portal

*Intelligently connecting students with their ideal roles using real-time skill matching, resume analysis, and automated recruitment workflows.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python)](https://flask.palletsprojects.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ What is PlaceAI?

PlaceAI is a full-stack, production-ready placement portal with three role-based dashboards, a Python AI microservice for intelligent resume-to-job matching, and a built-in resume checker that scores and improves your resume — all without any paid API keys.

> **Demo accounts are pre-seeded and ready to log in. No setup needed beyond `npm install`.**

---

## 🌐 Live Demo

* 🔗 Frontend: *(Add your deployed link)*
* 🔗 Backend API: *(Add link)*
* 🔗 AI Service: *(Add link if deployed)*

---

## 🧠 Key Highlights

* 🤖 **AI Resume Matching Engine** (No paid APIs)
* 📄 **Advanced Resume Analyzer (7 Metrics Scoring)**
* 👥 **Role-Based Dashboards** (Student / Recruiter / Admin)
* 📊 **Analytics Dashboard with Visual Insights**
* 📧 **Email Verification & Password Recovery**
* 📁 **Resume Upload & Profile Builder**
* ⚡ **Microservice Architecture (Node + Python AI)**

---

## 🏗️ Architecture

```
placement-portal/
├── client/          →  React 18 + Vite + Tailwind CSS    (port 5173)
├── server/          →  Node.js + Express + MongoDB        (port 5000)
└── ai-service/      →  Python Flask AI microservice       (port 8000)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB (local or Atlas)

---

### Step 1 — AI Service
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```
> ✅ Should print: `AI Skill Matching Service starting on port 8000...`

---

### Step 2 — Backend
```bash
cd server
npm install
npm run seed       # Seed demo users, jobs & applications
npm run dev
```
> ✅ Should print: `🚀 Server running on port 5000` and `MongoDB Connected`

---

### Step 3 — Frontend
```bash
cd client
npm install
npm run dev
```
> ✅ Open → **http://localhost:5173**

---

## 🔑 Demo Credentials

All accounts are **pre-verified** and ready to use immediately.

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | `admin@portal.com` | `admin123` |
| 🏢 Recruiter (Google) | `recruiter@google.com` | `recruiter123` |
| 🏢 Recruiter (Microsoft) | `recruiter@microsoft.com` | `recruiter123` |
| 🎓 Student (Full-Stack) | `alice@student.com` | `student123` |
| 🎓 Student (ML/AI) | `bob@student.com` | `student123` |
| 🎓 Student (Backend) | `carol@student.com` | `student123` |
| 🎓 Student (Frontend) | `david@student.com` | `student123` |

> 💡 **Tip:** Use the **Quick Demo Login** buttons on the login page to fill credentials automatically.

---

## 🎯 Features by Role

### 🎓 Student
| Feature | Description |
|---------|-------------|
| Email Verification | Account activated only after email confirmation |
| AI Job Matching | Every job shows a real-time AI-calculated match score |
| **Resume Checker** ⭐ | Paste your resume → get a score out of 100 + prioritized fixes |
| Resume Upload | PDF upload stored and linked to profile |
| Smart Job Feed | Jobs ranked by match score using the AI service |
| Application Tracking | Real-time status: Applied → Reviewing → Shortlisted → Hired |
| Profile Builder | Skills, education, projects, bio, phone |

### 🏢 Recruiter
| Feature | Description |
|---------|-------------|
| Job Posting | Full job form with skills, salary range, deadline |
| Ranked Applicants | Applicants sorted by AI match score — highest first |
| Status Management | Move applicants through the pipeline in one click |
| Application Details | View resume, cover letter, profile, and match breakdown |

### 🛡️ Admin
| Feature | Description |
|---------|-------------|
| Analytics Dashboard | Live platform stats with Recharts visualizations |
| Charts | Monthly applications, status distribution, top skills |
| User Management | Enable, disable, or delete any user |
| Job Oversight | Activate, deactivate, or remove any job posting |

---

## 🤖 AI Engine

PlaceAI ships with **two AI-powered features**, both implemented as a Python Flask microservice. No OpenAI API key needed.

### 1. Job Skill Matching
Matches student skills against job requirements using a 3-tier scoring model:

| Match Type | Score |
|------------|-------|
| Exact match | 100% |
| Partial / substring match | 60% |
| Category-based fallback | 30% |

- Alias normalization: `JS → JavaScript`, `k8s → Kubernetes`, `nodejs → Node.js`
- Graceful fallback to basic intersection scoring if the AI service is offline

### 2. Resume Checker (7-Dimension Analysis)
Scores your resume out of 100 across 7 weighted sections:

| Section | Weight | What's checked |
|---------|--------|----------------|
| Contact Info | 10% | Email, phone, LinkedIn, GitHub |
| Summary / Objective | 12% | Length, buzzwords, specificity |
| Work Experience | 28% | Action verbs, bullet points, quantified impact |
| Skills | 20% | Tech depth, categorization, recognizable tools |
| Education | 12% | Degree type, institution, graduation year |
| Projects | 10% | Tech stack, GitHub links, metrics |
| Formatting | 8% | Word count, bullet usage, whitespace |

Returns a **grade (A–F)**, section-by-section scores, and a prioritized fix list:
- 🔴 **Critical** — must fix before applying
- 🟡 **Important** — significantly boosts your score
- 🟢 **Nice-to-Have** — polish for top-tier applications

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/verify-email/:token` | Public |
| `POST` | `/api/auth/resend-verification` | Public |
| `POST` | `/api/auth/forgot-password` | Public |
| `POST` | `/api/auth/reset-password/:token` | Public |
| `GET` | `/api/auth/me` | 🔐 Auth |

### Jobs
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/jobs` | Public |
| `GET` | `/api/jobs/recommended` | 🎓 Student |
| `GET` | `/api/jobs/recruiter/myjobs` | 🏢 Recruiter |
| `GET` | `/api/jobs/:id` | Public |
| `GET` | `/api/jobs/:id/applicants` | 🏢 Recruiter |
| `POST` | `/api/jobs` | 🏢 Recruiter |
| `PUT` | `/api/jobs/:id` | 🏢 Recruiter |
| `DELETE` | `/api/jobs/:id` | 🏢 Recruiter |

### Applications
| Method | Endpoint | Access |
|--------|----------|--------|
| `POST` | `/api/applications/apply` | 🎓 Student |
| `GET` | `/api/applications/my` | 🎓 Student |
| `PUT` | `/api/applications/:id/status` | 🏢 Recruiter |
| `DELETE` | `/api/applications/:id/withdraw` | 🎓 Student |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/users/profile` | 🔐 Auth |
| `PUT` | `/api/users/profile` | 🔐 Auth |
| `POST` | `/api/users/upload-resume` | 🎓 Student |
| `PUT` | `/api/users/change-password` | 🔐 Auth |
| `POST` | `/api/users/resume-check` | 🔐 Auth |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| `GET` | `/api/admin/stats` | 🛡️ Admin |
| `GET` | `/api/admin/users` | 🛡️ Admin |
| `PUT` | `/api/admin/users/:id/toggle` | 🛡️ Admin |
| `DELETE` | `/api/admin/users/:id` | 🛡️ Admin |
| `GET` | `/api/admin/jobs` | 🛡️ Admin |
| `DELETE` | `/api/admin/jobs/:id` | 🛡️ Admin |

### AI Service (port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/match` | Match one student vs one job |
| `POST` | `/bulk-match` | Match student against many jobs |
| `POST` | `/analyze-resume` | Full resume analysis (7 sections) |
| `POST` | `/analyze-skills` | Categorize a list of skills |

---

## 🧱 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, Vite 5, Tailwind CSS v3 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Email** | Nodemailer (Ethereal test / Gmail SMTP) |
| **File Upload** | Multer |
| **AI Service** | Python 3, Flask, Flask-CORS |

---

## 📧 Email Setup

### Test Mode (default — zero config)
If `EMAIL_USER` is blank in `.env`, the app automatically uses **Ethereal** — a fake SMTP inbox. After a user registers, your **server terminal** will print:

```
📧 ============================================
📧 EMAIL SENT (Test Mode)
📧 To: user@example.com
📧 Preview URL: https://ethereal.email/message/abc123...
📧 ============================================
```

Open the Preview URL to see the real HTML email with a live verification button.

---

### Gmail Setup (production)
1. Enable **2-Step Verification** on your Google account
2. Go to: **Google Account → Security → App Passwords** → Create one for "Mail"
3. Copy the 16-character password and update `server/.env`:

```env
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

---

## 🔧 Environment Variables

`server/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_portal
JWT_SECRET=placeai_super_secret_jwt_key_2024
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email — leave blank to use Ethereal (automatic test mode)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=PlaceAI <noreply@placeai.com>
```

---

## 🛠️ Troubleshooting

### Port already in use
Change the port in `server/.env`:
```env
PORT=5001
```
Then update `client/vite.config.js` to match:
```js
'/api':     { target: 'http://localhost:5001', changeOrigin: true },
'/uploads': { target: 'http://localhost:5001', changeOrigin: true }
```

### MongoDB not connecting
Make sure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS / Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### AI service not responding
The app **gracefully falls back** to built-in scoring if the AI service is down. Restart it with:
```bash
cd ai-service && python app.py
```

### Re-seed the database
```bash
cd server && npm run seed
```
> ⚠️ This wipes all existing data and restores the default demo data.

---

## 📁 Project Structure

```
placement-portal/
│
├── client/
│   ├── src/
│   │   ├── components/        # Layout, StatsCard, StatusBadge, MatchScoreBadge, LoadingScreen
│   │   ├── contexts/          # AuthContext (JWT + auth state)
│   │   ├── pages/
│   │   │   ├── auth/          # Login, Register, VerifyEmail, ForgotPassword, ResetPassword
│   │   │   ├── student/       # Dashboard, Jobs, Applications, Profile, ResumeChecker
│   │   │   ├── recruiter/     # Dashboard, PostJob, Jobs, Applicants
│   │   │   └── admin/         # Dashboard, Users, Jobs
│   │   └── services/          # api.js (Axios instance + interceptors)
│   └── vite.config.js
│
├── server/
│   ├── config/                # MongoDB connection
│   ├── controllers/           # (reserved for future refactor)
│   ├── middleware/            # auth.js (JWT protect + authorize)
│   ├── models/                # User, Job, Application
│   ├── routes/                # auth, jobs, applications, users, admin
│   ├── seeds/                 # seed.js — demo data
│   ├── utils/                 # sendEmail.js (Ethereal + Gmail)
│   └── server.js
│
└── ai-service/
    ├── app.py                 # Flask API: /match, /bulk-match, /analyze-resume, /analyze-skills
    └── requirements.txt
```

---

## 👨‍💻 Author

**Jay K. Saini**

* 💼 Full Stack Developer
* 🌐 Portfolio: *(Add link)*
* 📧 Email: *(Add email)*

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---


---

<div align="center">

Built with ❤️ — PlaceAI © 2026

</div>
