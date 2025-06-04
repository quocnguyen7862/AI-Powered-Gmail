import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class UpdateDraftSchema(BaseModel):
    draft_id: str = Field(..., description="ID of the draft to update.")
    message: str = Field(..., description="Updated message content.")

class GmailUpdateDraft(GmailBaseTool):
    name:str = "update_gmail_draft"
    description:str = "Update an existing Gmail draft by its ID."
    args_schema: Type[UpdateDraftSchema] = UpdateDraftSchema

    def _run(self, draft_id: str, message: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            draft_body = {
                "id": draft_id,
                "message": {
                    "raw": base64.urlsafe_b64encode(message.encode()).decode()
                }
            }
            result = self.api_resource.users().drafts().update(userId="me", id=draft_id, body=draft_body).execute()
            return f"Draft {draft_id} updated successfully."
        except Exception as e:
            raise Exception(f"Failed to update draft: {e}")