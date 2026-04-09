# ⚡ PlaceAI — AI-Powered Placement Management System

> 🚀 A production-grade full-stack web application that intelligently connects students with recruiters using AI-driven resume analysis and skill-based job matching.

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

## 🏗️ System Architecture

```
Client (React + Vite)
        ↓
Backend (Node.js + Express)
        ↓
MongoDB Database
        ↓
AI Microservice (Python Flask)
```

---

## 👤 User Roles & Functionalities

### 🎓 Student

* AI-based job recommendations
* Resume score + improvement suggestions
* Apply & track applications
* Profile & skill management

### 🏢 Recruiter

* Post jobs with required skills
* View ranked candidates (AI score based)
* Manage hiring pipeline

### 🛡️ Admin

* Platform analytics dashboard
* User & job management
* System monitoring

---

## 🤖 AI Engine Explained

### 🔹 1. Skill Matching Algorithm

* Exact Match → 100%
* Partial Match → 60%
* Category Match → 30%

### 🔹 2. Resume Analyzer

Evaluates resume across:

* Contact Info
* Experience
* Skills
* Projects
* Education
* Formatting

📊 Output:

* Score (0–100)
* Grade (A–F)
* Actionable improvement tips

---

## 🧱 Tech Stack

| Layer       | Technology                |
| ----------- | ------------------------- |
| Frontend    | React, Vite, Tailwind CSS |
| Backend     | Node.js, Express          |
| Database    | MongoDB (Mongoose)        |
| AI Service  | Python, Flask             |
| Auth        | JWT, bcrypt               |
| Charts      | Recharts                  |
| File Upload | Multer                    |

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/placeai.git
cd placeai
```

### 2️⃣ Start AI Service

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### 3️⃣ Start Backend

```bash
cd server
npm install
npm run seed
npm run dev
```

### 4️⃣ Start Frontend

```bash
cd client
npm install
npm run dev
```

---

## 🔑 Demo Credentials

| Role      | Email                                               | Password     |
| --------- | --------------------------------------------------- | ------------ |
| Admin     | [admin@portal.com](mailto:admin@portal.com)         | admin123     |
| Recruiter | [recruiter@google.com](mailto:recruiter@google.com) | recruiter123 |
| Student   | [alice@student.com](mailto:alice@student.com)       | student123   |

---

## 📡 API Overview

* `/api/auth` → Authentication
* `/api/jobs` → Job Management
* `/api/applications` → Applications
* `/api/users` → Profile & Resume
* `/api/admin` → Admin Controls
* `/match` → AI Matching Engine

---

## 🧪 Future Improvements

* 📄 Resume Parsing (Auto skill extraction)
* 💬 Real-time Chat System
* 📈 Advanced Placement Analytics
* 🌐 Deployment with CI/CD

---

## 🏆 Why This Project Stands Out

✔ Real-world problem solving
✔ Microservice-based architecture
✔ AI integration without external APIs
✔ Scalable & production-ready design

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
