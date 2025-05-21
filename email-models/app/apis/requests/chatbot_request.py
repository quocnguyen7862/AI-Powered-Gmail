from .model_request import ModelRequest

class ChatbotRequest(ModelRequest):
    message: str
    refresh_token: str
    expiry_date: str
    access_token: str
    token_type: str
    id_token: str
    scope: str
    user_id: str
    client_id: str
    client_secret: str