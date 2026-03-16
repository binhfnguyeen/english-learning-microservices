import requests
from fastapi import HTTPException

from core.config import settings
from schemas.test_schema import TestResponse


def get_test(test_id: int, token: str) -> TestResponse:
    headers = {"Authorization": f"Bearer {token}"}

    try:
        res = requests.get(
            f"{settings.BACKEND_API_URL}/tests/{test_id}",
            headers=headers,
            timeout=10
        )

        if res.status_code != 200:
            raise HTTPException(
                status_code=res.status_code,
                detail="Failed to fetch user progress"
            )

        data = res.json()
        return TestResponse(**data["result"])

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))