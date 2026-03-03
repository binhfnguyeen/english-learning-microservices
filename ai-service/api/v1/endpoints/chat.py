from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from api.deps import get_token
from core.redis_chat import ChatStorage
from schemas.chat_schema import ChatRequest
from services.progress_service import get_user_progress
from services.ollama_service import call_llm
import json

router = APIRouter()

def build_prompt(user_message, history, progress):
    history_text = ""

    for msg in history:
        role = "Student" if msg["role"] == "user" else "Tutor"
        history_text += f"{role}: {msg['content']}\n"

    context = (
        f"Conversation history:\n{history_text}"
        if history_text
        else "No previous conversation."
    )

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
        - If history exists, you MUST use it.
        - Do NOT say you don't remember if history exists.
        - Use vocabulary appropriate to CEFR level.
        - Keep answers short and natural.
        - Encourage speaking.
        - Correct grammar gently.
        - Never respond in Vietnamese.
        """

    return f"""
        {system_instruction}
        
        {context}
        
        Student message:
        {user_message}
        
        Tutor reply:
    """


@router.post("/chat")
async def chat_with_tutor(
        request: ChatRequest,
        token: str = Depends(get_token)
):
    user_id = request.userId

    history = ChatStorage.get_history(user_id)
    progress = get_user_progress(user_id, token)

    prompt = build_prompt(
        user_message=request.message,
        history=history,
        progress=progress
    )

    response = call_llm(prompt).strip()

    response = (
        response.replace("Student:", "")
        .replace("Tutor:", "")
        .replace("Teacher:", "")
        .strip()
    )

    ChatStorage.push_message(user_id, "user", request.message)
    ChatStorage.push_message(user_id, "assistant", response)

    return {"reply": response}


@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    await websocket.accept()

    try:
        # Gửi lịch sử cũ
        history = ChatStorage.get_history(user_id)
        if history:
            await websocket.send_json({
                "type": "history",
                "data": [{"sender": "you" if m["role"] == "user" else "bot", "text": m["content"]} for m in history]
            })

        while True:
            data = await websocket.receive_json()
            user_message = data.get("message")
            if not user_message: continue

            # Lấy progress để AI biết trình độ học viên
            progress = get_user_progress(user_id, token)

            # Lấy lịch sử TRƯỚC khi lưu tin nhắn mới để làm context cho prompt
            current_history = ChatStorage.get_history(user_id)

            prompt = build_prompt(user_id, user_message, current_history, progress)
            ai_response = call_llm(prompt).strip()

            # Clean và lưu vào Redis
            ai_response = ai_response.replace("Tutor:", "").replace("Student:", "").strip()

            ChatStorage.push_message(user_id, "user", user_message)
            ChatStorage.push_message(user_id, "assistant", ai_response)

            # Gửi phản hồi về cho Frontend để cập nhật UI ngay lập tức
            await websocket.send_json({
                "type": "message",
                "sender": "bot",
                "text": ai_response
            })

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")