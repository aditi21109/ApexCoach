import os
from fastapi import APIRouter, HTTPException, status
from datetime import datetime, timedelta
from typing import List, Dict, Any
from database import users_collection, workouts_collection, goals_collection
from models import CoachRequest, CoachResponse

router = APIRouter(prefix="/coach", tags=["AI Coach"])

def aggregate_workout_data(workouts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Helper to aggregate workout metrics for prompt context:
    - Workout frequency (past 7 days)
    - Muscle group distribution
    - Volume calculation (sets * reps * weight)
    - Lift weight progression trends
    """
    total_workouts = len(workouts)
    if total_workouts == 0:
        return {
            "frequency_7_days": 0,
            "muscle_groups": {},
            "total_volume": 0,
            "progression": "No workouts logged yet."
        }
    
    # 1. Frequency in past 7 days
    now = datetime.now()
    seven_days_ago = now - timedelta(days=7)
    workouts_7_days = 0
    
    muscle_counts = {}
    total_volume = 0
    exercise_history = {} # exercise_name -> [(date, weight)]

    for w in workouts:
        # Date parsing
        try:
            w_date = datetime.strptime(w["date"], "%Y-%m-%d")
            if w_date >= seven_days_ago:
                workouts_7_days += 1
        except Exception:
            pass
        
        # Muscle group count
        mg = w.get("muscle_group", "Other").capitalize()
        muscle_counts[mg] = muscle_counts.get(mg, 0) + 1
        
        # Volume
        sets = w.get("sets", 0)
        reps = w.get("reps", 0)
        weight = w.get("weight", 0.0)
        total_volume += (sets * reps * weight)
        
        # Exercise progression
        ex_name = w.get("exercise_name", "").lower().strip()
        if ex_name:
            if ex_name not in exercise_history:
                exercise_history[ex_name] = []
            exercise_history[ex_name].append((w.get("date"), weight))

    # Weight progression strings
    progression_lines = []
    for ex_name, history in exercise_history.items():
        # Sort history by date ascending
        history.sort(key=lambda x: x[0])
        # If we have multiple entries, show progression
        if len(history) > 1:
            first_w = history[0][1]
            last_w = history[-1][1]
            diff = last_w - first_w
            progression_lines.append(
                f"- {ex_name.title()}: Started at {first_w} lbs/kg, currently at {last_w} lbs/kg (Change: {'+' if diff >= 0 else ''}{diff} lbs/kg)"
            )
        else:
            progression_lines.append(f"- {ex_name.title()}: Logged once at {history[0][1]} lbs/kg")

    progression_summary = "\n".join(progression_lines) if progression_lines else "Single entries logged, no progress curve yet."

    return {
        "frequency_7_days": workouts_7_days,
        "muscle_groups": muscle_counts,
        "total_volume": total_volume,
        "progression": progression_summary
    }

@router.post("", response_model=CoachResponse)
def ask_coach(request: CoachRequest):
    user_id = request.user_id
    question = request.question

    # 1. Fetch user profile
    user_profile = users_collection.find_one({"user_id": user_id})
    profile_str = "No profile created yet."
    user_goal = "General fitness"
    if user_profile:
        user_goal = user_profile.get("fitness_goal", "General fitness")
        profile_str = (
            f"Name: {user_profile.get('name', 'N/A')}, "
            f"Age: {user_profile.get('age', 'N/A')}, "
            f"General Goal: {user_goal}, "
            f"Email: {user_profile.get('email', 'N/A')}"
        )

    # 2. Fetch workout history
    workouts = list(workouts_collection.find({"user_id": user_id}))
    aggregated = aggregate_workout_data(workouts)
    
    workout_history_lines = []
    for w in sorted(workouts, key=lambda x: x.get("date", ""), reverse=True):
        workout_history_lines.append(
            f"- {w.get('date')}: {w.get('exercise_name')} ({w.get('muscle_group')}) - "
            f"{w.get('sets')} sets x {w.get('reps')} reps @ {w.get('weight')} lbs/kg"
        )
    workout_history_str = "\n".join(workout_history_lines) if workout_history_lines else "No workouts logged yet."

    # 3. Fetch goals
    goals = list(goals_collection.find({"user_id": user_id}))
    goals_lines = []
    for g in goals:
        status_str = "Completed" if g.get("completed", False) else "In Progress"
        goals_lines.append(
            f"- {g.get('goal_type')}: {g.get('target')} (Deadline: {g.get('deadline')}) [{status_str}]"
        )
    goals_str = "\n".join(goals_lines) if goals_lines else "No explicit goals set yet."

    # 4. Formulate instructions and context prompt
    system_instructions = (
        "You are 'Aegis', an elite personal trainer and AI fitness coach. "
        "Your role is to analyze workout logs and goals to provide personalized, metrics-driven, scientific feedback. "
        "DO NOT write a generic response. Directly analyze the provided workout logs, frequency, lift progression, "
        "and volume. Point out imbalances in training (e.g. training chest but missing legs or back), comment on weight progression "
        "of major lifts, compare their actual performance against their listed goals, and give clear, actionable training tips."
    )

    prompt = f"""
=== USER PROFILE ===
{profile_str}

=== ACTIVE & COMPLETED GOALS ===
{goals_str}

=== WORKOUT STATISTICS & AGGREGATIONS ===
- Workouts in last 7 days: {aggregated['frequency_7_days']}
- Muscle group training frequency: {aggregated['muscle_groups']}
- Total volume logged (all-time): {aggregated['total_volume']} lbs/kg
- Lift Progression Trends:
{aggregated['progression']}

=== DETAILED WORKOUT LOGS ===
{workout_history_str}

=== USER QUESTION ===
"{question}"

Please provide your analytical coaching response. Speak directly to the user.
"""

    # 5. Call LLM (Gemini or OpenAI) depending on environment keys
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                system_instruction=system_instructions
            )
            response = model.generate_content(prompt)
            return CoachResponse(response=response.text)
        except Exception as e:
            # Fall back to OpenAI or return error
            if not openai_key:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Gemini API error: {str(e)}"
                )

    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_instructions},
                    {"role": "user", "content": prompt}
                ]
            )
            return CoachResponse(response=completion.choices[0].message.content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OpenAI API error: {str(e)}"
            )

    # 6. Fallback Mock response for test/dev mode when no keys are configured
    mock_response = (
        "🤖 **[Developer Mode - No API Key Found]**\n\n"
        f"Hi! I am your AI Fitness Coach. I noticed you asked: *\"{question}\"*\n\n"
        "Here is my analysis of your data:\n\n"
        f"1. **Muscle Group Balance**: Your logged muscle groups are: {aggregated['muscle_groups'] or 'None yet'}. "
    )
    
    # Analyze muscle balance
    chest_count = aggregated['muscle_groups'].get('Chest', 0)
    legs_count = aggregated['muscle_groups'].get('Legs', 0)
    
    if len(workouts) == 0:
        mock_response += "You haven't logged any workouts yet. Add a few exercises so I can perform a comprehensive volume analysis."
    else:
        if chest_count > legs_count * 2:
            mock_response += f"You have trained Chest ({chest_count} times) significantly more than Legs ({legs_count} times). I recommend adding leg days to avoid lower-body imbalances."
        else:
            mock_response += "Your training distribution looks balanced across muscle groups! Keep up the consistency."
            
        mock_response += f"\n\n2. **Progression**: {aggregated['progression']}"
        mock_response += f"\n\n3. **Weekly Consistency**: You did {aggregated['frequency_7_days']} sessions in the last week. "
        
        # Analyze goals
        if goals:
            mock_response += f"\n\n4. **Goal Target**: You have {len(goals)} active goal(s). Make sure you follow the workout schedule to hit your target by the deadline!"
        else:
            mock_response += "\n\n4. **Goal Advice**: You don't have any fitness goals tracked yet. Use the Goal Tracker below to create one, and I'll analyze how close you are to reaching it."

    return CoachResponse(response=mock_response)
