from pydantic import BaseModel

class ChatRequest(BaseModel):
    userId: int
    message: str