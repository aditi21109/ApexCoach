from fastapi import APIRouter, HTTPException, status  # type: ignore
from bson import ObjectId  # type: ignore
from typing import List
from database import workouts_collection  # type: ignore
from models import WorkoutCreate, WorkoutResponse  # type: ignore

router = APIRouter(prefix="/workouts", tags=["Workouts"])

def serialize_workout(doc) -> dict:
    if not doc:
        return {}
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(workout: WorkoutCreate):
    workout_dict = workout.model_dump()
    result = workouts_collection.insert_one(workout_dict)
    inserted_workout = workouts_collection.find_one({"_id": result.inserted_id})
    if not inserted_workout:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created workout"
        )
    return serialize_workout(inserted_workout)

@router.get("/{user_id}", response_model=List[WorkoutResponse])
def get_workout_history(user_id: str):
    workouts = list(workouts_collection.find({"user_id": user_id}).sort("date", -1))
    return [serialize_workout(w) for w in workouts]

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_workout(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workout ID format"
        )
    
    result = workouts_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    return {"message": "Workout deleted successfully", "id": id}
