from typing import List

from pydantic import BaseModel

class VocabularyResponse(BaseModel):
    id: int
    word: str
    meaning: str
    partOfSpeech: str
    level: str
    picture: str


class ChoiceResponse(BaseModel):
    id: int
    isCorrect: bool
    vocabulary: VocabularyResponse


class QuestionResponse(BaseModel):
    id: int
    content: str
    choices: List[ChoiceResponse]


class TestResponse(BaseModel):
    id: int
    title: str
    description: str
    difficultyLevel: str
    questions: List[QuestionResponse]

    model_config = {
        "from_attributes": True
    }