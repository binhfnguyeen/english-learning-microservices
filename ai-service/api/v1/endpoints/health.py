from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    return {"status": "AI Service running", "model": "Whisper + Ollama"}
