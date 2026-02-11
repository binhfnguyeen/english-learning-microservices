import requests
from fastapi import HTTPException
from core.config import settings

def get_user_progress(user_id: int, token: str) -> dict:
    headers = {"Authorization": f"Bearer {token}"}

    try:
        res = requests.get(
            f"{settings.BACKEND_API_URL}/progress/{user_id}/overview",
            headers=headers,
            timeout=10
        )

        if res.status_code != 200:
            raise HTTPException(
                status_code=res.status_code,
                detail="Failed to fetch user progress"
            )

        return res.json()["result"]

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))