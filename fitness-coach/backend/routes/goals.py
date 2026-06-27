from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from typing import List
from database import goals_collection
from models import GoalCreate, GoalResponse

router = APIRouter(prefix="/goals", tags=["Goals"])

def serialize_goal(doc) -> dict:
    if not doc:
        return {}
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal: GoalCreate):
    goal_dict = goal.model_dump()
    result = goals_collection.insert_one(goal_dict)
    inserted_goal = goals_collection.find_one({"_id": result.inserted_id})
    if not inserted_goal:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created goal"
        )
    return serialize_goal(inserted_goal)

@router.get("/{user_id}", response_model=List[GoalResponse])
def get_user_goals(user_id: str):
    goals = list(goals_collection.find({"user_id": user_id}))
    return [serialize_goal(g) for g in goals]

@router.patch("/{id}/toggle", response_model=GoalResponse)
def toggle_goal_completion(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goal ID format"
        )
    
    goal = goals_collection.find_one({"_id": obj_id})
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    new_completed_status = not goal.get("completed", False)
    goals_collection.update_one(
        {"_id": obj_id},
        {"$set": {"completed": new_completed_status}}
    )
    
    updated_goal = goals_collection.find_one({"_id": obj_id})
    return serialize_goal(updated_goal)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_goal(id: str):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goal ID format"
        )
    
    result = goals_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    return {"message": "Goal deleted successfully", "id": id}
