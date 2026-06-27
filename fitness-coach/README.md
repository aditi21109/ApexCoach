# Apex Coach - AI Fitness Coach & Workout Tracker

Apex Coach is a production-grade full-stack web application designed to help users track workouts, define fitness milestones, visualize muscular load distribution and progression curve, and get analytical, metrics-driven feedback from a personal AI trainer ("Aegis").

---

## Folder Architecture

```text
fitness-coach/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── routes/
│   │   ├── ai_coach.py
│   │   ├── workouts.py
│   │   ├── goals.py
│   │   └── users.py
│   ├── .env
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── WorkoutForm.jsx
    │   │   ├── WorkoutHistory.jsx
    │   │   ├── ProgressChart.jsx
    │   │   ├── GoalTracker.jsx
    │   │   └── AICoach.jsx
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── index.css
    ├── index.html
    └── package.json
```

---

## 1. Setup Instructions & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **Python** (v3.9 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas Connection String)

### Install Backend Dependencies
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Install Frontend Dependencies
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```

---

## 2. Environment Configurations & API Setup

### Backend Environment Variables (`backend/.env`)
Create a `.env` file in the `backend/` folder and paste the following parameters:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
DB_NAME=fitness_coach_db

# AI API Keys (Configure at least one to enable live AI Coaching)
# GEMINI_API_KEY=your_gemini_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here
```

### AI API Setup Details
- **Google Gemini (Recommended)**: 
  1. Go to the [Google AI Studio](https://aistudio.google.com/).
  2. Create a new API key.
  3. Uncomment and set `GEMINI_API_KEY=...` in your `.env`.
- **OpenAI**:
  1. Go to the [OpenAI Platform](https://platform.openai.com/).
  2. Generate a Secret Key.
  3. Uncomment and set `OPENAI_API_KEY=...` in your `.env`.

*Note: If neither key is present, the app automatically transitions to **Developer Fallback Mode**, simulating workout telemetry analysis locally so you can still test all core features.*

### MongoDB Atlas Setup (Cloud Database)
To use a cloud database instead of localhost:
1. Sign up for a free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster (M0 Sandbox is free).
3. Under **Database Access**, create a user with a secure password (make note of it).
4. Under **Network Access**, click "Add IP Address" and select "Allow Access From Anywhere" (or input your specific IP for production security).
5. In the Clusters dashboard, click **Connect** > **Drivers** (Python version 3.6 or later).
6. Copy the connection string. It will look like:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
7. Replace `<username>` and `<password>` with the credentials of the user created in step 3, and configure `MONGO_URI` in `backend/.env` with this URL.

---

## 3. How to Run Locally

### Start MongoDB
If using a local MongoDB database, ensure the mongo daemon is running:
```bash
mongod
```

### Start the Python FastAPI Server
Run this from the `backend/` folder:
```bash
uvicorn main:app --reload --port 8000
```
- API Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)
- Base Server endpoint: [http://localhost:8000](http://localhost:8000)

### Start the React Dev Server (Vite)
Run this from the `frontend/` folder:
```bash
npm run dev
```
- Local dashboard address: [http://localhost:5173](http://localhost:5173)

---

## 4. Deployment Steps

### Backend Deployment (Render or Heroku)
1. Commit the backend folder to a Git repository.
2. Push to GitHub/GitLab.
3. Sign up at [Render.com](https://render.com) and click **New > Web Service**.
4. Link your repository.
5. Configure environment details:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. In **Environment Variables**, add:
   - `MONGO_URI` (Atlas connection string)
   - `DB_NAME`
   - `GEMINI_API_KEY` (or `OPENAI_API_KEY`)
7. Click Deploy. Render will generate a URL like `https://my-fitness-coach-api.onrender.com`.

### Frontend Deployment (Vercel or Netlify)
1. Create a production build locally or configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
2. Create an environment configuration parameter:
   - **Environment Variable**: `VITE_API_URL`
   - **Value**: The Render URL of your backend (e.g. `https://my-fitness-coach-api.onrender.com`)
3. Connect your repository to Vercel or Netlify and trigger a deploy!
