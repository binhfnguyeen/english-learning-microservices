from pydantic import BaseModel
from schemas.user_schema import UserResponse

class ProgressResponse(BaseModel):
    user: UserResponse
    daysStudied: int
    wordsLearned: int
    cefr: str
    proficiency: str
    xp: int