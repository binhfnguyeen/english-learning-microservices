from faster_whisper import WhisperModel
from core.config import settings

print("⏳ Loading Whisper model...")
stt_model = WhisperModel(
    settings.WHISPER_MODEL_SIZE,
    device="cpu",
    compute_type="int8"
)
print("✅ Whisper ready")

def get_model():
    return stt_model