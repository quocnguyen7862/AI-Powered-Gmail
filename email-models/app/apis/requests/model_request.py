from pydantic import BaseModel
from typing import Optional
class ModelRequest(BaseModel):
    model: str
    provider: str
    api_key: str
    api_key_type: str
    user_id: str
    user_name: Optional[str] = None