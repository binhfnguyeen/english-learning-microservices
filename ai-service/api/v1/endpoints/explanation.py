import asyncio
import json

from fastapi import APIRouter, Depends, HTTPException

from api.deps import get_token
from schemas.test_schema import TestResponse
from services.ollama_service import call_llm
from services.progress_service import get_user_progress
from services.test_service import get_test

router = APIRouter()

def build_explain_prompt(test: TestResponse, cefr: str):
    test_data_json = test.model_dump_json()

    return f"""
        You are an English teacher helping Vietnamese students.
        
        Explain the vocabulary test answers.
        
        IMPORTANT RULES:
        - You MUST write the explanation in Vietnamese.
        - Do NOT use Spanish or English for explanation.
        - Keep the explanation simple for CEFR {cefr} learners.
        - Return ONLY valid JSON.
        
        Format:
        {{
          "questions":[
            {{
              "question":"",
              "correctAnswer":"",
              "explanation":""
            }}
          ]
        }}
        
        Test data:
        {test_data_json}
    """


@router.get("/explanation")
async def test_explanation(
        test_id: int,
        user_id: int,
        token: str = Depends(get_token)
):
    try:
        progress_task = asyncio.to_thread(get_user_progress, user_id, token)
        test_task = asyncio.to_thread(get_test, test_id, token)

        progress, test = await asyncio.gather(progress_task, test_task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lấy dữ liệu từ Backend: {str(e)}")

    if not test:
        raise HTTPException(status_code=404, detail="Không tìm thấy nội dung bài kiểm tra")

    cefr_level = progress.cefr if progress else "A1"
    prompt = build_explain_prompt(test, cefr_level)

    try:
        raw_response = await asyncio.to_thread(
            call_llm,
            prompt,
            "json",
            600
        )

        try:
            explanation_json = json.loads(raw_response)
        except Exception:
            explanation_json = {"raw": raw_response}

        return {
            "testId": test_id,
            "userLevel": cefr_level,
            "explanation": explanation_json
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý AI: {str(e)}")
