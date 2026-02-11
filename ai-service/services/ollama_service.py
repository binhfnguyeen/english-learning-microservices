import requests
from core.config import settings

def call_llm(prompt: str, format: str = None):
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False
    }
    if format: payload["format"] = format
    res = requests.post(settings.OLLAMA_API_URL, json=payload)
    return res.json().get("response")