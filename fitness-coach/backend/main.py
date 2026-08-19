from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from routes import workouts, goals, ai_coach, users  # type: ignore
import uvicorn  # type: ignore
import os

app = FastAPI(
    title="AI Fitness Coach & Workout Tracker API",
    description="Backend API for logging workouts, setting goals, and consulting an AI coach",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(workouts.router)
app.include_router(goals.router)
app.include_router(ai_coach.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the AI Fitness Coach API",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

