from pydantic import BaseModel

class ModelRequest(BaseModel):
    model: str
    provider: str
    api_key: str
    api_key_type: str