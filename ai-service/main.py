import os
import shutil
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

app = FastAPI()

# 1. Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Cấu hình & Load Model
# - Ollama chạy ở cổng mặc định 11434
OLLAMA_API_URL = os.getenv(
    "OLLAMA_API_URL",
    "http://localhost:11434/api/generate"
)
# - Java Backend chạy ở cổng 8080 (hoặc cổng Gateway của bạn)
BACKEND_API_URL = os.getenv(
    "BACKEND_API_URL",
    "http://localhost:8080/api"
)

print("⏳ Đang tải model Whisper (lần đầu sẽ hơi lâu)...")
stt_model = WhisperModel("base", device="cpu", compute_type="int8")
print("✅ Whisper model đã sẵn sàng!")

class ChatRequest(BaseModel):
    userId: int
    message: str

class VocabRequest(BaseModel):
    userId: int
    topic: str

# --- HELPER: Lấy thông tin Level từ Java Backend ---
def get_user_level(user_id: int) -> str:
    """
    Gọi sang Java Backend để lấy thông tin user.
    Nếu lỗi hoặc không tìm thấy, mặc định là 'Beginner'.
    """
    try:
        response = requests.get(f"{BACKEND_API_URL}/users/{user_id}", timeout=2)
        if response.status_code == 200:
            data = response.json().get("result", {})
            return "Intermediate"
    except Exception as e:
        print(f"⚠️ Không gọi được Backend: {e}")

    return "Beginner"


# --- API 1: CHAT CÁ NHÂN HÓA ---
@app.post("/api/ai/chat")
async def chat_with_tutor(request: ChatRequest):
    # 1. Lấy context (Level)
    user_level = get_user_level(request.userId)

    # 2. Tạo Prompt
    system_instruction = (
        f"You are an English AI Tutor. The student is at {user_level} level. "
        "Keep your answers short, encouraging, and easy to understand. "
        "Correct their grammar if they make mistakes."
    )

    prompt = f"{system_instruction}\n\nStudent: {request.message}\nTutor:"

    # 3. Gọi Ollama
    try:
        payload = {
            "model": "llama3", # Hoặc 'gemma2', 'qwen2.5' tùy cái bạn đã pull
            "prompt": prompt,
            "stream": False
        }
        res = requests.post(OLLAMA_API_URL, json=payload).json()
        return {"reply": res.get("response", "Sorry, I am sleeping.")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- API 2: GỢI Ý TỪ VỰNG ---
@app.post("/api/ai/suggest-vocab")
async def suggest_vocab(request: VocabRequest):
    user_level = get_user_level(request.userId)

    # Yêu cầu trả về JSON thuần
    prompt = (
        f"Suggest 5 English vocabulary words related to the topic '{request.topic}' "
        f"suitable for a {user_level} level student. "
        "Return strictly a JSON array with format: [{\"word\": \"...\", \"meaning\": \"... (in Vietnamese)\", \"example\": \"...\"}]. "
        "Do not output anything else."
    )

    try:
        payload = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False,
            "format": "json" # Ollama hỗ trợ mode JSON giúp output chuẩn hơn
        }
        res = requests.post(OLLAMA_API_URL, json=payload).json()
        return {"data": res.get("response")} # Frontend sẽ nhận chuỗi JSON này và parse ra
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- API 3: LUYỆN NÓI (SPEAKING CHECK) ---
@app.post("/api/ai/speaking-check")
async def check_speaking(
        file: UploadFile = File(...),
        target_text: str = Body(default="") # Câu mẫu người dùng cần đọc (nếu có)
):
    temp_filename = f"temp_{file.filename}"

    try:
        # 1. Lưu file tạm
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Speech-to-Text (Offline)
        segments, _ = stt_model.transcribe(temp_filename)
        user_said = " ".join([s.text for s in segments]).strip()

        # 3. Chấm điểm bằng AI
        prompt = (
            f"Target sentence: \"{target_text}\"\n"
            f"User said: \"{user_said}\"\n"
            "Task: Compare user input with target. "
            "1. Give a score (0-100). "
            "2. Point out pronunciation errors or missing words. "
            "3. Reply in Vietnamese. "
            "Output format:\nScore: ...\nFeedback: ..."
        )

        payload = {
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
        ai_res = requests.post(OLLAMA_API_URL, json=payload).json()

        return {
            "user_said": user_said,
            "feedback": ai_res.get("response")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Dọn dẹp file tạm
        if os.path.exists(temp_filename):
            os.remove(temp_filename)


@app.get("/")
def health_check():
    return {"status": "AI Service is running", "model": "Whisper + Ollama"}