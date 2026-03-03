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
    history = ChatStorage.get_history(user_id)
    history_text = ""
    for msg in history:
        role = "Student" if msg["role"] == "user" else "Tutor"
        history_text += f"{role}: {msg['content']}\n"
    if history_text:
        context = f"Conversation history:\n{history_text}"
    else:
        context = "No previous conversation."
    progress = get_user_progress(user_id, token)
    system_instruction = f"""
        You are an English AI Tutor.
        
        IMPORTANT OUTPUT RULES:
        - You must reply with ONLY the Tutor's message.
        - Do NOT include "Student:".
        - Do NOT include "Tutor:".
        - Do NOT create a dialogue.
        - Do NOT repeat the student's question.
        - Only write the final Tutor answer.
        
        Student level:
        - CEFR: {progress['cefr']}
        - Proficiency: {progress['proficiency']}
        
        Conversation rules:
        - The conversation history below is real.
        - If the student asks about previous messages, you MUST answer using the history.
        - Do NOT say you don't remember if history exists.
        - Only say "I don't remember any previous message." if there is no history.
        - Use vocabulary appropriate to the CEFR level.
        - Keep answers short and natural.
        - Encourage speaking.
        - Correct grammar gently.
        - Never respond in Vietnamese.
    """
    prompt = f"""
        {system_instruction}
        
        {context}
        
        Student message:
        {request.message}
        
        Tutor reply:
    """
    response = call_llm(prompt)
    response = (
        response.replace("Student:", "")
        .replace("Tutor:", "")
        .replace("Teacher:", "")
        .strip()
    )
    ChatStorage.push_message(user_id, "user", request.message)
    ChatStorage.push_message(user_id, "assistant", response)

    return {"reply": response}