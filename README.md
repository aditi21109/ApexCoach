# Apex Coach - AI Fitness Tracker & Personal Trainer

Apex Coach is a modern full-stack web application featuring a stunning **neobrutalist cream-and-pastel theme**. It helps athletes track workouts, define training milestones, analyze muscle load distributions, and receive metrics-driven coaching feedback from a personal virtual trainer (**Aegis**).

🔗 **Live Repository**: [https://github.com/aditi21109/ApexCoach](https://github.com/aditi21109/ApexCoach)

---

## 📸 Interface Preview
*   **Background**: Warm, soft cream canvas (`#FAF6EE`).
*   **Sidebar Dock**: Premium floating dark navbar panel (`#131313`) for category navigation.
*   **Stats Grid**: Interactive rounded card blocks in soft pastel shades (Yellow, Pink, Green, Blue).
*   **Timeline log**: Vertical activity timeline connecting completed logs.
*   **Calendar**: Visual date highlights for training frequency.

---

## 📁 Repository Structure

```text
ApexCoach/ (Root Repository)
├── .vscode/               # Workspace editor settings
├── .gitignore             # Safety configuration for Git
├── README.md              # Project documentation
└── fitness-coach/
    ├── backend/
    │   ├── main.py        # FastAPI entrypoint
    │   ├── database.py    # MongoDB and In-memory datastore fallback
    │   ├── models.py      # Pydantic schemas
    │   ├── routes/
    │   │   ├── ai_coach.py
    │   │   ├── workouts.py
    │   │   ├── goals.py
    │   │   └── users.py
    │   ├── .env
    │   └── requirements.txt
    └── frontend/
        ├── package.json
        ├── tailwind.config.js
        ├── vite.config.js
        └── src/
            ├── components/   # AICoach, GoalTracker, ProgressChart, etc.
            ├── pages/        # Dashboard layout coordinates
            ├── services/     # Axios client connectors
            └── index.css     # Neobrutalist design tokens
```

---

## 🛠️ Setup & Local Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **MongoDB** (Local instance or MongoDB Atlas Connection URI)

### 1. Set Up the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd fitness-coach/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file inside the `backend` folder and add your connection string:
   ```env
   MONGO_URI=mongodb+srv://your_username:your_password@cluster0.abcde.mongodb.net/?appName=Cluster0
   DB_NAME=fitness_coach_db
   
   # Optional: Configure keys to connect to Gemini/OpenAI models
   # GEMINI_API_KEY=your_gemini_api_key
   # OPENAI_API_KEY=your_openai_api_key
   ```
   *Note: If no connection string is specified or MongoDB is offline, the server automatically boots using an **In-Memory Mock Datastore** fallback so you can test all features offline.*
4. Start the FastAPI server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```
   - Docs endpoint: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Set Up the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd fitness-coach/frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🌟 Key Features

*   **Dual-Tab Login Landing Page**: Support for searching existing athlete profiles via email lookup or creating a new profile.
*   **Automatic SQLite/In-Memory Fallback**: Runs completely in-memory if MongoDB services are offline.
*   **Aegis AI Personal Coach**: Contextual LLM assistant that scans your workout telemetry history, reviews milestones, and generates exercise recommendations.
*   **Recharts Data Visualizations**: Clean, flat line graphs and muscle group volume loading distribution bars.
*   **Responsive Sidebar Navigation**: Click through Dashboard, Workout logs, and Target Milestones tabs.
