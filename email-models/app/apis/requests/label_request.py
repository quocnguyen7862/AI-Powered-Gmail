from pydantic import BaseModel

class LabelRequest(BaseModel):
    user_id: str
    label: str
    description: str