from .model_request import ModelRequest
class EmailRequest(ModelRequest):
    email_data: str
    attachments: list = []