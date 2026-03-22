import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.progress_service import get_user_progress
from services.ollama_service import call_llm

router = APIRouter()

def build_vocab_prompt(topic: str, cefr: str):
    return f"""
        You are a strict JSON API.
        
        Generate EXACTLY 3 English vocabulary words for CEFR {cefr}
        about the topic "{topic}".
        
        STRICT RULES:
        - Return valid JSON only.
        - No explanation.
        - No text before or after JSON.
        - Keep meaning under 15 words.
        - Keep example under 12 words.
        - Exactly 3 items.
        
        Use EXACTLY this format:
        
        {{
          "vocabulary_list": [
            {{
              "word": "string",
              "meaning": "short meaning",
              "example": "short example"
            }}
          ]
        }}
    """


def extract_json(text: str):
    start = text.find("{")
    end = text.rfind("}") + 1

    if start != -1 and end != -1:
        return text[start:end]

    return text


@router.websocket("/ws/vocab/{user_id}")
async def websocket_vocab(websocket: WebSocket, user_id: str):
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()

            topic = data.get("topic")

            if not topic:
                await websocket.send_json({
                    "type": "error",
                    "message": "Topic is required"
                })
                continue

            progress = get_user_progress(user_id, token)

            prompt = build_vocab_prompt(
                topic=topic,
                cefr=progress.cefr
            )

            # Gọi LLM (timeout 180s)
            raw_response = await asyncio.to_thread(
                call_llm,
                prompt,
                "json",
                180
            )

            try:
                cleaned = extract_json(raw_response)
                data_json = json.loads(cleaned)

                # Handle format chắc chắn
                if "vocabulary_list" in data_json:
                    vocab_list = data_json["vocabulary_list"]
                else:
                    vocab_list = []

            except Exception as e:
                print("JSON ERROR:", e)
                print("RAW RESPONSE:", raw_response)

                await websocket.send_json({
                    "type": "error",
                    "message": "AI returned invalid JSON"
                })
                continue

            # Gửi từng từ
            for item in vocab_list:
                await websocket.send_json({
                    "type": "vocab",
                    "data": item
                })

            await websocket.send_json({
                "type": "done"
            })

    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")