from typing import Optional
from .model_request import ModelRequest

class ReplyRequest(ModelRequest):
    draft_id: str
    summary : Optional[str] = None
    message: str
    attachments: Optional[list] = []