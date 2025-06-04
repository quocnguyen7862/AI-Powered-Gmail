import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class DeleteLabelSchema(BaseModel):
    label_id: str = Field(..., description="ID of the label to delete.")

class GmailDeleteLabel(GmailBaseTool):
    name:str = "delete_gmail_label"
    description:str = "Delete a Gmail label by its ID."
    args_schema: Type[DeleteLabelSchema] = DeleteLabelSchema

    def _run(self, label_id: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            self.api_resource.users().labels().delete(userId='me', id=label_id).execute()
            return f"Label with ID {label_id} deleted."
        except Exception as e:
            raise Exception(f"Failed to delete label: {e}")