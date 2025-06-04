import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class CreateLabelSchema(BaseModel):
    label_name: str = Field(..., description="Name of the label to create.")

class GmailCreateLabel(GmailBaseTool):
    name:str = "create_gmail_label"
    description:str = "Create a new Gmail label."
    args_schema: Type[CreateLabelSchema] = CreateLabelSchema

    def _run(self, label_name: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            body = {
                'name': label_name,
                'labelListVisibility': 'labelShow',
                'messageListVisibility': 'show'
            }
            result = self.api_resource.users().labels().create(userId='me', body=body).execute()
            return f"Label '{label_name}' created. ID: {result['id']}"
        except Exception as e:
            raise Exception(f"Failed to create label: {e}")