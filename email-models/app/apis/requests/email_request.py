from pydantic import BaseModel

class EmailRequest(BaseModel):
    email_content: str