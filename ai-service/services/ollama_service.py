import json

import httpx
import requests
from core.config import settings

def call_llm(prompt: str, format: str = None, timeout: int = 120):
    payload = {
        "model": "phi3",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 600,
            "temperature": 0.7
        }
    }
    if format:
        payload["format"] = format
    try:
        res = requests.post(
            settings.OLLAMA_API_URL,
            json=payload,
            timeout=timeout
        )
        res.raise_for_status()
        return res.json().get("response")
    except Exception as e:
        print(f"LLM error: {e}")
        return "Sorry, the system is busy."


async def stream_llm_async(messages: list, format: str = None, timeout: int = 120):
    api_url = settings.OLLAMA_API_URL.replace("/api/generate", "/api/chat")
    payload = {
        "model": "phi3",
        "messages": messages,
        "stream": True,
        "options": {
            "num_predict": 600,
            "temperature": 0.7
        }
    }
    if format:
        payload["format"] = format

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", api_url, json=payload) as response:
                response.raise_for_status()

                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        chunk = data.get("message", {}).get("content", "")
                        if chunk:
                            yield chunk

    except Exception as e:
        print(f"LLM stream error: {e}")
        yield "Sorry, the system is busy."