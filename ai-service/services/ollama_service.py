import json
import httpx
import requests
import logging
from core.config import settings

logger = logging.getLogger(__name__)

def call_llm(prompt: str, format: str = None, timeout: int = 120, num_predict: int = 300):
    payload = {
        "model": "phi3",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": num_predict,
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
        logger.error(f"LLM error: {e}")
        return "Sorry, the system is busy."


async def stream_llm_async(messages: list, format: str = None, timeout: int = 120, num_predict: int = 300):
    # Chuyển đổi endpoint từ /generate sang /chat
    api_url = settings.OLLAMA_API_URL.replace("/api/generate", "/api/chat")
    
    payload = {
        "model": "phi3",
        "messages": messages,
        "stream": True,
        "options": {
            "num_predict": num_predict,
            "temperature": 0.7,
            "num_ctx": 2048
        }
    }
    if format:
        payload["format"] = format

    try:
        # Sử dụng httpx để stream
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", api_url, json=payload) as response:
                if response.status_code != 200:
                    error_detail = await response.aread()
                    logger.error(f"Ollama Error ({response.status_code}): {error_detail.decode()}")
                    yield "Ollama is having trouble. Please try again."
                    return

                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            chunk = data.get("message", {}).get("content", "")
                            if chunk:
                                yield chunk
                        except json.JSONDecodeError:
                            continue

    except httpx.ConnectError:
        logger.error("Could not connect to Ollama. Is it running?")
        yield "Cannot connect to AI model."
    except httpx.TimeoutException:
        logger.error("Ollama request timed out.")
        yield "AI is taking too long to respond."
    except Exception as e:
        logger.error(f"LLM stream unexpected error: {e}")
        yield "An unexpected error occurred."