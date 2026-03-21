from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from api.deps import get_token
from core.redis_chat import RedisStorage as ChatStorage
from schemas.chat_schema import ChatRequest
from services.progress_service import get_user_progress
from services.ollama_service import call_llm

router = APIRouter()

def build_history_text(history):
    history_text = ""
    for msg in history:
        role = "Student" if msg["role"] == "user" else "Tutor"
        history_text += f"{role}: {msg['content']}\n"
    return history_text


def build_context(history):
    history_text = build_history_text(history)
    return (
        f"Conversation history:\n{history_text}"
        if history_text
        else "No previous conversation."
    )


def build_prompt_base(user_message, context, system_instruction):
    return f"""
        {system_instruction}
        
        {context}
        
        Student message:
        {user_message}
        
        Tutor reply:
    """


def build_prompt_chat(user_message, history, progress):
    context = build_context(history)

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
        - CEFR: {progress.cefr}
        - Proficiency: {progress.proficiency}
        
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

    return build_prompt_base(user_message, context, system_instruction)


def build_prompt_speaking(user_message, history, progress):
    context = build_context(history)

    system_instruction = f"""
        You are an expert English Speaking Coach.
        
        STUDENT INFO: CEFR {progress.cefr}, Proficiency {progress.proficiency}.
        
        RULES:
        1. Keep responses under 3 sentences.
        2. Gently correct grammar.
        3. Provide IPA for difficult words.
        4. End with an open-ended question.
        5. Match CEFR level.
    """

    return build_prompt_base(user_message, context, system_instruction)


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


async def handle_chat_loop(websocket, user_id, token, namespace, build_prompt_fn):
    while True:
        data = await websocket.receive_json()
        user_message = data.get("message")
        if not user_message:
            continue

        progress = get_user_progress(user_id, token)
        history = ChatStorage.get_history(namespace, user_id)

        prompt = build_prompt_fn(user_message, history, progress)

        ai_response = clean_ai_response(call_llm(prompt))

        ChatStorage.push_message(namespace, user_id, "user", user_message)
        ChatStorage.push_message(namespace, user_id, "assistant", ai_response)

        await websocket.send_json({
            "type": "message",
            "sender": "bot",
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

        await handle_chat_loop(
            websocket, user_id, token, namespace, build_prompt_chat
        )

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

        await handle_chat_loop(
            websocket, user_id, token, namespace, build_prompt_speaking
        )

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close(code=1011)