from fastapi import APIRouter, Depends
from api.deps import get_token
from services.progress_service import get_user_progress
from services.ollama_service import call_llm
from schemas.vocab_schema import VocabRequest

router = APIRouter()

@router.post("/suggest-vocab")
async def suggest_vocab(
        request: VocabRequest,
        token: str = Depends(get_token)
):
    progress = get_user_progress(request.userId, token)

    prompt = (
        f"Suggest 5 English vocabulary words for CEFR {progress['cefr']} "
        f"about topic '{request.topic}'. "
        "Return JSON only with format: "
        "[{\"word\":\"\",\"meaning\":\"\",\"example\":\"\"}]"
    )

    response = call_llm(prompt, format="json")

    return {"data": response}
