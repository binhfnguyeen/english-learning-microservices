import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.v1.endpoints import chat, vocab, health, rag
from core.eureka import connect_eureka_forever
from services.knowledge_loader import load_all_knowledge

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Đăng ký Eureka
    eureka_task = asyncio.create_task(connect_eureka_forever())

    # Load toàn bộ knowledge base vào FAISS khi startup
    logger.info("[Startup] Loading knowledge base into RAG...")
    await asyncio.to_thread(load_all_knowledge)
    logger.info("[Startup] Knowledge base loaded successfully.")

    yield

    eureka_task.cancel()

app = FastAPI(
    title="AI Service",
    lifespan=lifespan,
    docs_url="/api/ai/docs",
    openapi_url="/api/ai/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/ai", tags=["AI"])
app.include_router(chat.router, prefix="/api/ai", tags=["AI"])
app.include_router(vocab.router, prefix="/api/ai", tags=["AI"])
app.include_router(rag.router, prefix="/api/ai", tags=["RAG"])