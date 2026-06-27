from pydantic import BaseModel, Field, EmailStr  # type: ignore
from typing import Optional, List

class UserProfile(BaseModel):
    user_id: str = Field(..., description="Unique identifier for the user (e.g. from local storage)")
    name: str = Field(..., min_length=1)
    email: EmailStr
    age: int = Field(..., ge=1, le=120)
    fitness_goal: str = Field(..., description="General goal, e.g. Build muscle, Lose weight, Endurance")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "user_123",
                "name": "Jane Doe",
                "email": "jane@example.com",
                "age": 28,
                "fitness_goal": "Build muscle"
            }
        }
    }

class WorkoutCreate(BaseModel):
    user_id: str
    exercise_name: str = Field(..., min_length=1)
    muscle_group: str = Field(..., description="e.g. Chest, Back, Legs, Shoulders, Arms, Core")
    sets: int = Field(..., gt=0)
    reps: int = Field(..., gt=0)
    weight: float = Field(..., ge=0)
    date: str = Field(..., description="Format YYYY-MM-DD")

class WorkoutResponse(WorkoutCreate):
    id: str

class GoalCreate(BaseModel):
    user_id: str
    goal_type: str = Field(..., description="e.g., Weight progression, Workout volume, Weekly frequency")
    target: str = Field(..., description="e.g. Squat 225 lbs, Complete 4 workouts/week")
    deadline: str = Field(..., description="Format YYYY-MM-DD")
    completed: bool = False

class GoalResponse(GoalCreate):
    id: str

class CoachRequest(BaseModel):
    user_id: str
    question: str

class CoachResponse(BaseModel):
    response: str
