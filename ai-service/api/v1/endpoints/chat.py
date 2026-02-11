from fastapi import APIRouter, Depends
from api.deps import get_token
from schemas.chat_schema import ChatRequest
from services.progress_service import get_user_progress
from services.ollama_service import call_llm

router = APIRouter()

@router.post("/chat")
async def chat_with_tutor(
        request: ChatRequest,
        token: str = Depends(get_token)
):
    progress = get_user_progress(request.userId, token)

    system_instruction = f"""
    You are an English AI Tutor.

    Student level:
    - CEFR: {progress['cefr']}
    - Proficiency: {progress['proficiency']}

    Rules:
    - Match vocabulary to CEFR
    - Encourage speaking
    - Correct grammar gently
    """

    prompt = f"{system_instruction}\nStudent: {request.message}\nTutor:"

    response = call_llm(prompt)

    return {"reply": response}
