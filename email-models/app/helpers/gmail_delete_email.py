import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class TrashThreadSchema(BaseModel):
    thread_id: str = Field(..., description="ID of the thread to move to trash.")

class GmailTrashThread(GmailBaseTool):
    name:str = "trash_gmail_thread"
    description:str = "Move a Gmail thread to trash using its thread ID."
    args_schema: Type[TrashThreadSchema] = TrashThreadSchema

    def _run(self, thread_id: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            self.api_resource.users().threads().trash(userId='me', id=thread_id).execute()
            return f"Thread with ID {thread_id} moved to trash."
        except Exception as e:
            raise Exception(f"Failed to trash thread: {e}")
        
class UntrashThreadSchema(BaseModel):
    thread_id: str = Field(..., description="ID of the thread to restore from trash.")

class GmailUntrashThread(GmailBaseTool):
    name:str = "untrash_gmail_thread"
    description:str = "Restore a Gmail thread from trash using its thread ID."
    args_schema: Type[UntrashThreadSchema] = UntrashThreadSchema

    def _run(self, thread_id: str,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            self.api_resource.users().threads().untrash(userId='me', id=thread_id).execute()
            return f"Thread with ID {thread_id} restored from trash."
        except Exception as e:
            raise Exception(f"Failed to untrash thread: {e}")
