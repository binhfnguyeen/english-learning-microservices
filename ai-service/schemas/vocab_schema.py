from pydantic import BaseModel

class VocabRequest(BaseModel):
    userId: int
    topic: str