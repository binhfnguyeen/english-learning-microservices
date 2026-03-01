from fastapi import APIRouter, Depends
from api.deps import get_token
from core.redis_chat import ChatStorage
from schemas.chat_schema import ChatRequest
from services.progress_service import get_user_progress
from services.ollama_service import call_llm

router = APIRouter()

@router.post("/chat")
async def chat_with_tutor(
        request: ChatRequest,
        token: str = Depends(get_token)
):
    user_id = request.userId

    # 1. Lấy lịch sử chat
    history = ChatStorage.get_history(user_id)

    history_text = ""
    for msg in history:
        role = "Student" if msg["role"] == "user" else "Tutor"
        history_text += f"{role}: {msg['content']}\n"

    if history_text:
        context = f"Conversation history:\n{history_text}"
    else:
        context = "No previous conversation."

    # 2. Lấy level học viên
    progress = get_user_progress(user_id, token)

    system_instruction = f"""
        You are an English AI Tutor.
        
        Student level:
        - CEFR: {progress['cefr']}
        - Proficiency: {progress['proficiency']}
        
        Rules:
        - The conversation history below is real.
        - If the student asks about previous messages, you MUST answer using the history.
        - Do NOT say you don't remember if history is provided.
        - Only say "I don't remember any previous message." if the history section says "No previous conversation."
        - Match vocabulary to CEFR.
        - Keep answers short and natural.
        - Encourage speaking.
        - Correct grammar gently.
    """

    # 3. Build prompt
    prompt = f"""
        {system_instruction}
        
        {context}
        
        Student: {request.message}
        Tutor:
    """

    # 4. Gọi AI
    response = call_llm(prompt)

    # 5. Lưu lịch sử vào Redis
    ChatStorage.push_message(user_id, "user", request.message)
    ChatStorage.push_message(user_id, "assistant", response)

    return {"reply": response}
