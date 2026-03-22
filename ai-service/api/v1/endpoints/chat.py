from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from core.redis_chat import RedisStorage as ChatStorage
from services.progress_service import get_user_progress
from services.ollama_service import stream_llm_async

router = APIRouter()

def build_chat_messages(user_message, history, progress, is_speaking=False):
    if is_speaking:
        system_instruction = f"""
            You are a calm, real human practicing English in a voice call.
            STUDENT INFO: CEFR {progress.cefr}, Proficiency {progress.proficiency}.
            
            STRICT VOICE CHAT RULES:
            1. Keep responses extremely short (1-2 sentences maximum).
            2. Act normal and calm. DO NOT use emojis, exclamation marks, or excessive enthusiasm (e.g., NEVER say "Hey there!", "Wow!", or "😊").
            3. Ask exactly ONE natural follow-up question to keep the conversation going. Do not ask multiple questions.
            4. Gently correct grammar by naturally reusing the corrected phrase in your reply without pointing it out.
            5. Match CEFR level and Proficiency.
            6. Never respond in Vietnamese.
        """
    else:
        system_instruction = f"""
            You are an English AI Tutor.
            
            Student level:
            - CEFR: {progress.cefr}
            - Proficiency: {progress.proficiency}
            
            Conversation rules:
            - Keep answers short and natural.
            - Encourage speaking.
            - Correct grammar gently.
            - Never respond in Vietnamese.
        """

    messages = [{"role": "system", "content": system_instruction.strip()}]

    # Thêm lịch sử chat vào ngữ cảnh
    if history:
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Thêm tin nhắn mới nhất của user
    messages.append({"role": "user", "content": user_message})

    return messages


def clean_ai_response(response: str) -> str:
    return (
        response
        .replace("Tutor:", "")
        .replace("Student:", "")
        .strip()
    )


async def send_history(websocket, history):
    if history:
        await websocket.send_json({
            "type": "history",
            "data": [
                {
                    "sender": "you" if m["role"] == "user" else "bot",
                    "text": m["content"]
                }
                for m in history
            ]
        })


async def handle_chat_loop(websocket, user_id, token, namespace, is_speaking=False):
    while True:
        data = await websocket.receive_json()
        user_message = data.get("message")
        if not user_message:
            continue

        progress = get_user_progress(user_id, token)
        history = ChatStorage.get_history(namespace, user_id)

        # 1. Khởi tạo mảng hội thoại
        messages = build_chat_messages(user_message, history, progress, is_speaking)

        # 2. Báo hiệu cho Frontend bắt đầu stream (tạo bóng chat rỗng)
        await websocket.send_json({
            "type": "stream_start",
            "sender": "bot"
        })

        # 3. Stream từng chunk chữ về Frontend
        full_ai_response = ""
        async for chunk in stream_llm_async(messages):
            full_ai_response += chunk
            await websocket.send_json({
                "type": "stream_chunk",
                "text": chunk
            })

        # 4. Khi hoàn tất, clean data và lưu vào Redis
        ai_response = clean_ai_response(full_ai_response)
        ChatStorage.push_message(namespace, user_id, "user", user_message)
        ChatStorage.push_message(namespace, user_id, "assistant", ai_response)

        # 5. Báo Frontend đã hoàn thành để trigger TTS đọc giọng nói
        await websocket.send_json({
            "type": "stream_done",
            "text": ai_response
        })


@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    namespace = "chat_history"
    await websocket.accept()

    try:
        history = ChatStorage.get_history(namespace, user_id)
        await send_history(websocket, history)

        # Trạng thái is_speaking = False cho trợ lý gõ text thông thường
        await handle_chat_loop(websocket, user_id, token, namespace, is_speaking=False)

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close(code=1011)


@router.websocket("/ws/speaking/{user_id}")
async def websocket_speaking(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    namespace = "speaking_history"
    await websocket.accept()

    try:
        history = ChatStorage.get_history(namespace, user_id)
        await send_history(websocket, history)

        # Trạng thái is_speaking = True cho trợ lý luyện nói
        await handle_chat_loop(websocket, user_id, token, namespace, is_speaking=True)

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close(code=1011)