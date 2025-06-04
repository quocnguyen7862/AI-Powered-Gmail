import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class ListLabelsSchema(BaseModel):
    pass  # No input required

class GmailListLabels(GmailBaseTool):
    name:str = "list_gmail_labels"
    description:str = "List all Gmail labels available in the user's mailbox."
    args_schema: Type[ListLabelsSchema] = ListLabelsSchema

    def _run(self,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            results = self.api_resource.users().labels().list(userId="me").execute()
            labels = results.get("labels", [])
            if not labels:
                return "No labels found."
            return "\n".join([f"{label['id']}: {label['name']}" for label in labels])
        except Exception as e:
            raise Exception(f"Failed to list labels: {e}")