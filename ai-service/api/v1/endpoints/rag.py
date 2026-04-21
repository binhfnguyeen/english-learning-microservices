import asyncio
import logging
import os, faiss
from fastapi import APIRouter, HTTPException, UploadFile, File
from services.rag_service import rag_service
from services.knowledge_loader import load_all_knowledge
from schemas.ingest_schema import IngestTextRequest, SearchRequest, IngestVocabRequest

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/rag/stats")
def get_rag_stats():
    """Trả về thông tin về RAG index hiện tại."""
    return rag_service.get_stats()


@router.post("/rag/ingest/text")
async def ingest_text(request: IngestTextRequest):
    """
    Thêm danh sách tài liệu văn bản vào RAG index.
    - auto_chunk=true: tự động chia thành chunk nhỏ
    """
    if not request.documents:
        raise HTTPException(status_code=400, detail="No documents provided.")

    try:
        await asyncio.to_thread(
            rag_service.add_documents,
            request.documents,
            request.auto_chunk
        )
        stats = rag_service.get_stats()
        return {
            "message": f"Successfully indexed {len(request.documents)} document(s).",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"[RAG] Ingest error: {e}")
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@router.post("/rag/ingest/vocab")
async def ingest_vocab(request: IngestVocabRequest):
    """
    Endpoint dành riêng cho Admin/Backend đồng bộ từ vựng.
    Tự động format dữ liệu trước khi vector hóa.
    """
    if not request.items:
        raise HTTPException(status_code=400, detail="No items provided.")

    formatted_docs = []
    for item in request.items:
        doc = f"Vocabulary: {item.word} | Meaning: {item.meaning}"
        if item.partOfSpeech:
            doc += f" | Part of Speech: {item.partOfSpeech}"
        if item.level:
            doc += f" | Level: {item.level}"
        formatted_docs.append(doc)

    try:
        await asyncio.to_thread(rag_service.add_documents, formatted_docs, False)
        return {"message": f"Successfully indexed {len(formatted_docs)} vocabulary words."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rag/ingest/file")
async def ingest_file(file: UploadFile = File(...)):
    """
    Upload file .txt hoặc .md để index vào RAG.
    File được lưu tạm vào knowledge_base/ rồi tự động index.
    """
    if not file.filename.endswith((".txt", ".md")):
        raise HTTPException(status_code=400, detail="Only .txt and .md files are supported.")

    save_path = f"knowledge_base/{file.filename}"
    try:
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    try:
        await asyncio.to_thread(rag_service.add_document_from_file, save_path)
        stats = rag_service.get_stats()
        return {
            "message": f"File '{file.filename}' indexed successfully.",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"[RAG] File ingest error: {e}")
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")


@router.post("/rag/search")
async def search_context(request: SearchRequest):
    """
    Test endpoint: tìm kiếm context liên quan nhất với query.
    Dùng để kiểm tra chất lượng RAG retrieval.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    context = await asyncio.to_thread(
        rag_service.retrieve_context,
        request.query,
        request.top_k
    )

    return {
        "query": request.query,
        "context": context if context else "No relevant context found.",
        "has_context": bool(context)
    }


@router.post("/rag/reload-knowledge")
async def reload_knowledge():
    """
    Xóa toàn bộ FAISS index và re-index lại knowledge_base/.
    Dùng khi cập nhật tài liệu trong knowledge_base/.
    """
    rag_service.index = faiss.IndexFlatL2(rag_service.dimension)
    rag_service.documents = []

    for path in ["faiss_store/index.faiss", "faiss_store/documents.json"]:
        if os.path.exists(path):
            os.remove(path)

    await asyncio.to_thread(load_all_knowledge)
    stats = rag_service.get_stats()
    return {
        "message": "Knowledge base reloaded successfully.",
        "stats": stats
    }
