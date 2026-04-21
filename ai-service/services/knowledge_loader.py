import os
import logging
from services.rag_service import rag_service

logger = logging.getLogger(__name__)

KNOWLEDGE_BASE_DIR = "knowledge_base"


def load_all_knowledge():
    """
    Tự động đọc và index toàn bộ file trong thư mục knowledge_base/.
    Chỉ index khi FAISS index đang trống (tránh duplicate khi restart).
    """
    if rag_service.index.ntotal > 0:
        logger.info(
            f"[KnowledgeLoader] FAISS already has {rag_service.index.ntotal} vectors. "
            f"Skipping re-indexing."
        )
        return

    if not os.path.exists(KNOWLEDGE_BASE_DIR):
        logger.warning(f"[KnowledgeLoader] Directory '{KNOWLEDGE_BASE_DIR}' not found. Skipping.")
        return

    files = [
        f for f in os.listdir(KNOWLEDGE_BASE_DIR)
        if f.endswith(".txt") or f.endswith(".md")
    ]

    if not files:
        logger.warning(f"[KnowledgeLoader] No .txt or .md files found in '{KNOWLEDGE_BASE_DIR}'.")
        return

    logger.info(f"[KnowledgeLoader] Found {len(files)} knowledge files. Indexing...")
    for filename in sorted(files):
        path = os.path.join(KNOWLEDGE_BASE_DIR, filename)
        try:
            rag_service.add_document_from_file(path)
            logger.info(f"[KnowledgeLoader] ✅ Indexed: {filename}")
        except Exception as e:
            logger.error(f"[KnowledgeLoader] ❌ Failed to index {filename}: {e}")

    stats = rag_service.get_stats()
    logger.info(
        f"[KnowledgeLoader] Done! Total vectors: {stats['total_vectors']}, "
        f"Total chunks: {stats['total_documents']}"
    )
