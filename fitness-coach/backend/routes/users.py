from fastapi import APIRouter, HTTPException, status
from database import users_collection
from models import UserProfile

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("", response_model=UserProfile, status_code=status.HTTP_200_OK)
def save_user_profile(profile: UserProfile):
    # Upsert based on user_id
    profile_dict = profile.model_dump()
    profile_dict["email"] = profile_dict["email"].strip().lower()
    result = users_collection.update_one(
        {"user_id": profile.user_id},
        {"$set": profile_dict},
        upsert=True
    )
    
    saved_profile = users_collection.find_one({"user_id": profile.user_id})
    if not saved_profile:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile after saving"
        )
    # Remove _id from response
    if "_id" in saved_profile:
        del saved_profile["_id"]
    return saved_profile

@router.get("/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: str):
    profile = users_collection.find_one({"user_id": user_id})
    if not profile:
        # Return a default user profile to ensure standard UI initialization
        return UserProfile(
            user_id=user_id,
            name="Fitness Enthusiast",
            email="fitness@example.com",
            age=25,
            fitness_goal="Build muscle and stay active"
        )
    if "_id" in profile:
        del profile["_id"]
    return profile

@router.get("/email/{email}", response_model=UserProfile)
def get_user_by_email(email: str):
    profile = users_collection.find_one({"email": email.strip().lower()})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found with this email"
        )
    if "_id" in profile:
        del profile["_id"]
    return profile
