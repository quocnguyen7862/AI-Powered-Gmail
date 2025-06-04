from .model_request import ModelRequest
from typing import Optional

class ChatbotRequest(ModelRequest):
    message: str
    refresh_token: str
    expiry_date: str
    access_token: str
    token_type: str
    id_token: str
    scope: str
    client_id: str
    client_secret: str
    thread_id: Optional[str] = None
    email_id: Optional[str] = None