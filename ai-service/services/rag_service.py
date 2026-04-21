import os
import json
import logging
import requests
import numpy as np
import faiss
from core.config import settings

logger = logging.getLogger(__name__)

# Đường dẫn lưu FAISS index và documents trên disk
FAISS_INDEX_PATH = "faiss_store/index.faiss"
DOCUMENTS_PATH = "faiss_store/documents.json"


class RAGService:
    def __init__(self):
        self.embed_model = "nomic-embed-text"
        # nomic-embed-text trả về vector có số chiều (dimension) là 768
        self.dimension = 768

        # Khởi tạo Index của FAISS (dùng L2 distance)
        self.index = faiss.IndexFlatL2(self.dimension)
        self.documents: list[str] = []  # Lưu lại nội dung text gốc tương ứng với vector

        # Load index đã lưu từ disk (nếu có)
        self._load_from_disk()

    # ─────────────────────── Persistence ────────────────────────

    def _load_from_disk(self):
        """Khôi phục FAISS index và documents từ disk khi khởi động."""
        if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(DOCUMENTS_PATH):
            try:
                self.index = faiss.read_index(FAISS_INDEX_PATH)
                with open(DOCUMENTS_PATH, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                logger.info(
                    f"[RAG] Loaded FAISS index from disk: {self.index.ntotal} vectors, "
                    f"{len(self.documents)} documents."
                )
            except Exception as e:
                logger.warning(f"[RAG] Could not load FAISS from disk: {e}. Starting fresh.")
        else:
            logger.info("[RAG] No existing FAISS index found. Starting fresh.")

    def _save_to_disk(self):
        """Lưu FAISS index và documents xuống disk để persist sau restart."""
        os.makedirs("faiss_store", exist_ok=True)
        faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(DOCUMENTS_PATH, "w", encoding="utf-8") as f:
            json.dump(self.documents, f, ensure_ascii=False, indent=2)
        logger.info(f"[RAG] Saved FAISS index to disk: {self.index.ntotal} vectors.")

    # ─────────────────────── Embedding ────────────────────────

    def get_embedding(self, text: str) -> np.ndarray:
        """Gọi Ollama để biến text thành vector embedding."""
        url = settings.OLLAMA_API_URL.replace("/api/generate", "/api/embeddings")
        payload = {
            "model": self.embed_model,
            "prompt": text
        }
        res = requests.post(url, json=payload, timeout=30)
        res.raise_for_status()
        embedding = res.json().get("embedding")
            
        return np.array([embedding], dtype=np.float32)

    # ─────────────────────── Chunking ────────────────────────

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
        """
        Chia text dài thành các chunk nhỏ hơn để embedding chính xác hơn.
        """
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk = " ".join(words[start:end])
            chunks.append(chunk)
            start += chunk_size - overlap
        return chunks

    # ─────────────────────── Indexing ────────────────────────

    def add_documents(self, docs: list[str], auto_chunk: bool = True):
        """
        Học tài liệu mới: chunk → tạo embedding → lưu vào FAISS.
        """
        new_vectors = []
        new_docs = []

        for doc in docs:
            chunks = self.chunk_text(doc) if auto_chunk else [doc]
            for chunk in chunks:
                chunk = chunk.strip()
                if not chunk:
                    continue
                try:
                    emb = self.get_embedding(chunk)
                    new_vectors.append(emb)
                    new_docs.append(chunk)
                except Exception as e:
                    logger.warning(f"[RAG] Skipping chunk due to embedding error: {e}")

        if new_vectors:
            matrix = np.vstack(new_vectors)
            self.index.add(matrix)
            self.documents.extend(new_docs)
            self._save_to_disk()
            logger.info(f"[RAG] Added {len(new_docs)} chunks. Total: {self.index.ntotal} vectors.")

    def add_document_from_file(self, file_path: str):
        """
        Đọc file text và index toàn bộ nội dung vào FAISS.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        if "##" in content:
            sections = [s.strip() for s in content.split("##") if s.strip()]
            docs = ["## " + s for s in sections]
        else:
            docs = [content]

        self.add_documents(docs)
        logger.info(f"[RAG] Indexed file: {file_path}")

    # ─────────────────────── Retrieval ────────────────────────

    def retrieve_context(self, query: str, top_k: int = 3, score_threshold: float = 600.0) -> str:
        """
        Tìm kiếm ngữ cảnh liên quan nhất với câu hỏi của user.
        """
        if self.index.ntotal == 0:
            return ""

        try:
            query_emb = self.get_embedding(query)
            distances, indices = self.index.search(query_emb, min(top_k, self.index.ntotal))
            
            results = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx != -1 and idx < len(self.documents):
                    if dist <= score_threshold:
                        results.append(self.documents[idx])

            return "\n\n---\n\n".join(results)
        except Exception as e:
            logger.error(f"[RAG] Error retrieving context: {e}")
            return ""

    def get_stats(self) -> dict:
        """Trả về thống kê RAG index và 5 doc đầu để verify."""
        return {
            "total_vectors": self.index.ntotal,
            "total_documents": len(self.documents),
            "dimension": self.dimension,
            "embed_model": self.embed_model,
            "document_previews": [d[:80] + "..." for d in self.documents[:5]]
        }


# Singleton instance
rag_service = RAGService()