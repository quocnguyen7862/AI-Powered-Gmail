import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class RemoveLabelByNameSchema(BaseModel):
    message_id: str = Field(..., description="ID of the email.")
    label_name: str = Field(..., description="Name of the label to remove.")

class GmailRemoveLabelByName(GmailBaseTool):
    name:str = "remove_gmail_label_by_name"
    description:str = "Remove a label from an email by specifying the label name."
    args_schema: Type[RemoveLabelByNameSchema] = RemoveLabelByNameSchema

    def _run(self, message_id: str, label_name: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            labels = self.api_resource.users().labels().list(userId="me").execute().get("labels", [])
            label_id = next((label["id"] for label in labels if label["name"].lower() == label_name.lower()), None)
            if not label_id:
                return f"Label '{label_name}' not found."
            self.api_resource.users().messages().modify(
                userId='me', id=message_id,
                body={'removeLabelIds': [label_id]}
            ).execute()
            return f"Label '{label_name}' removed from message {message_id}."
        except Exception as e:
            raise Exception(f"Failed to remove label: {e}")