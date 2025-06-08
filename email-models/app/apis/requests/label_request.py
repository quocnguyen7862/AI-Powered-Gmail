from pydantic import BaseModel
from typing import TypedDict, Optional,List
from .model_request import ModelRequest

class LabelRequest(ModelRequest):
    user_id: str
    labels: List[str]
    summary: str