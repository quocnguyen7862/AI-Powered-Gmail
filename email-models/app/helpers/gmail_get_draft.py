import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class GetDraftSchema(BaseModel):
    draft_id: str = Field(..., description="ID of the draft to retrieve.")

class GmailGetDraft(GmailBaseTool):
    name:str = "get_gmail_draft"
    description:str = "Retrieve a Gmail draft by its ID."
    args_schema: Type[GetDraftSchema] = GetDraftSchema

    def _run(self, draft_id: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            draft = self.api_resource.users().drafts().get(userId="me", id=draft_id).execute()
            return f"Draft ID: {draft['id']}, Message: {draft['message']['snippet']}"
        except Exception as e:
            raise Exception(f"Failed to get draft: {e}")