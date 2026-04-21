import asyncio
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from core.redis_chat import RedisStorage as ChatStorage
from services.progress_service import get_user_progress
from services.ollama_service import stream_llm_async
from services.rag_service import rag_service

router = APIRouter()

MAX_CONTEXT_CHARS = 400

def build_chat_messages(user_message, history, progress, is_speaking=False, context=""):
    if context and len(context) > MAX_CONTEXT_CHARS:
        context = context[:MAX_CONTEXT_CHARS].rsplit(" ", 1)[0] + "..."

    context_block = f"\nContext: {context}" if context else ""

    if is_speaking:
        system_instruction = (
            f"You are a calm human in a voice call. "
            f"CEFR {progress.cefr}, Proficiency {progress.proficiency}. "
            f"Rules: 1-2 sentences max. No emojis. One follow-up question. "
            f"Correct grammar gently. English only.{context_block}"
        )
    else:
        system_instruction = (
            f"You are an English AI Tutor. "
            f"Student: CEFR {progress.cefr}, Proficiency {progress.proficiency}. "
            f"Rules: Short natural answers. Encourage speaking. Correct grammar gently. English only.{context_block}"
        )

    messages = [{"role": "system", "content": system_instruction}]

    if history:
        for msg in history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

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
    num_predict = 80 if is_speaking else 250

    while True:
        data = await websocket.receive_json()
        user_message = data.get("message")
        if not user_message:
            continue

        progress_task = asyncio.to_thread(get_user_progress, user_id, token)
        history_task = asyncio.to_thread(ChatStorage.get_history, namespace, user_id)
        rag_task = asyncio.to_thread(rag_service.retrieve_context, user_message, top_k=2)

        progress, history, retrieved_context = await asyncio.gather(
            progress_task, 
            history_task, 
            rag_task
        )

        messages = build_chat_messages(user_message, history, progress, is_speaking, retrieved_context)

        await websocket.send_json({
            "type": "stream_start",
            "sender": "bot"
        })

        full_ai_response = ""
        async for chunk in stream_llm_async(messages, num_predict=num_predict):
            full_ai_response += chunk
            await websocket.send_json({
                "type": "stream_chunk",
                "text": chunk
            })

        ai_response = clean_ai_response(full_ai_response)
        ChatStorage.push_message(namespace, user_id, "user", user_message)
        ChatStorage.push_message(namespace, user_id, "assistant", ai_response)
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

        await handle_chat_loop(websocket, user_id, token, namespace, is_speaking=True)

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close(code=1011)