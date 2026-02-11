from fastapi import APIRouter, Depends
from api.deps import get_token
from services.progress_service import get_user_progress
from services.ollama_service import call_llm

router = APIRouter()

@router.post("/personalize-path/{user_id}")
async def personalize_learning_path(
        user_id: int,
        token: str = Depends(get_token)
):
    progress = get_user_progress(user_id, token)

    prompt = f"""
    Student profile:
    - CEFR: {progress['cefr']}
    - Proficiency: {progress['proficiency']}
    - XP: {progress['xp']}

    Create a personalized 7-day English learning plan.
    Include vocabulary, speaking, listening, grammar.
    Return JSON.
    """

    response = call_llm(prompt, format="json")

    return {
        "profile": progress,
        "learning_plan": response
    }
