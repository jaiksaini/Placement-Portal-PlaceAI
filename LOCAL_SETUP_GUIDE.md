# Local Setup Guide - Placement Portal

This guide provides the steps to set up and run the entire Placement Portal project on your local Windows machine.

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (The project is currently configured to use a cloud database, but if you want to use a local one, ensure it's running.)

---

## 1. AI Service Setup (Python)

The AI service handles skill matching and resume analysis.

1. **Open a terminal** in the `ai-service` directory:
   ```powershell
   cd ai-service
   ```

2. **Create a virtual environment**:
   ```powershell
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   ```powershell
   .\venv\Scripts\activate
   ```

4. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

5. **Run the AI Service**:
   ```powershell
   python app.py
   ```
   *The service will start on `http://localhost:8000`.*

---

## 2. Backend Server Setup (Node.js)

The backend handles authentication, job management, and database interactions.

1. **Open a new terminal** in the `server` directory:
   ```powershell
   cd server
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Configure Environment Variables**:
   - Ensure a `.env` file exists in the `server` folder.
   - For a quick start, you can copy `.env.example` to `.env`.
   - Ensure `AI_SERVICE_URL` is set to `http://localhost:8000`.

4. **Run the Server**:
   ```powershell
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

---

## 3. Frontend Client Setup (Vite/React)

The frontend is the user interface for students, recruiters, and admins.

1. **Open a new terminal** in the `client` directory:
   ```powershell
   cd client
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Run the Client**:
   ```powershell
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

---

## Running Everything Together

To run the full project, you need **three separate terminals** open, each running one of the services above.

> [!IMPORTANT]
> Always start the **AI Service** and **Backend Server** before the **Frontend** to ensure all features (like login and resume analysis) work correctly.

> [!TIP]
> If you close your terminals, the services will stop. You will need to re-activate the Python `venv` and run the `npm run dev` commands again next time.
