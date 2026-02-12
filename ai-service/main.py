from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.v1.endpoints import chat, vocab, learning_path, health
from core.eureka import init_eureka


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_eureka(app)
    yield

app = FastAPI(title="AI Service", lifespan=lifespan)

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
