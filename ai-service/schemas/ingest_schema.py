from pydantic import BaseModel
from typing import Optional

class IngestTextRequest(BaseModel):
    documents: list[str]
    auto_chunk: Optional[bool] = True


class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3


class VocabData(BaseModel):
    word: str
    meaning: str
    partOfSpeech: Optional[str] = ""
    level: Optional[str] = ""


class IngestVocabRequest(BaseModel):
    items: list[VocabData]