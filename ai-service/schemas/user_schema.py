from datetime import datetime
from typing import Optional

from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    firstName: str
    lastName: str
    email: str
    phone: str
    username: str
    isActive: bool
    avatar: Optional[str] = None
    role: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None