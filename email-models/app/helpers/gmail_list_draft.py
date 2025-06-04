import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class ListDraftsSchema(BaseModel):
    max_results: Optional[int] = Field(10, description="Maximum number of drafts to list.")

class GmailListDrafts(GmailBaseTool):
    name:str = "list_gmail_drafts"
    description:str = "List drafts in the user's Gmail account."
    args_schema: Type[ListDraftsSchema] = ListDraftsSchema

    def _run(self, max_results: int = 10,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            drafts = self.api_resource.users().drafts().list(userId="me", maxResults=max_results).execute()
            draft_items = drafts.get("drafts", [])
            if not draft_items:
                return "No drafts found."
            return "\n".join([f"Draft ID: {d['id']}" for d in draft_items])
        except Exception as e:
            raise Exception(f"Failed to list drafts: {e}")