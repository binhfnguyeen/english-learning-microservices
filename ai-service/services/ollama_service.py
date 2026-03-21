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
        return "Xin lỗi, hệ thống đang bận."
