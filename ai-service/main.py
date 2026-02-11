from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.v1.endpoints import chat, vocab, learning_path, health

app = FastAPI(title="AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router, prefix="/api/ai", tags=["AI"])
app.include_router(vocab.router, prefix="/api/ai", tags=["AI"])
app.include_router(learning_path.router, prefix="/api/ai", tags=["AI"])
