import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from langchain_core.callbacks import CallbackManagerForToolRun
from pydantic import BaseModel, Field

from langchain_community.tools.gmail.base import GmailBaseTool

class GmailReplySchema(BaseModel):
    """Input schema to reply to a Gmail message."""
    message_id: str = Field(..., description="The ID of the message being replied to.")
    to: List[str] = Field(..., description="Recipient(s) of the reply.")
    subject: str = Field(..., description="Subject of the reply.")
    message: str = Field(..., description="Reply message body.")
    cc: Optional[List[str]] = Field(None, description="CC recipients.")
    bcc: Optional[List[str]] = Field(None, description="BCC recipients.")

class GmailReplyToEmail(GmailBaseTool):
    name:str = "reply_gmail_message"
    description:str = "Reply to a specific Gmail message using its message ID."
    args_schema: Type[GmailReplySchema] = GmailReplySchema

    def _run(
        self,
        message_id: str,
        to: List[str],
        subject: str,
        message: str,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        try:
            # Tạo email mới dưới dạng trả lời
            reply = EmailMessage()
            reply.set_content(message)
            reply["To"] = ", ".join(to)
            reply["Subject"] = subject
            if cc:
                reply["Cc"] = ", ".join(cc)
            if bcc:
                reply["Bcc"] = ", ".join(bcc)
            reply["In-Reply-To"] = message_id
            reply["References"] = message_id

            encoded_message = base64.urlsafe_b64encode(reply.as_bytes()).decode()

            # Gửi tin nhắn
            sent_message = self.api_resource.users().messages().send(
                userId="me",
                body={"raw": encoded_message, "threadId": self._get_thread_id(message_id)}
            ).execute()

            return f"Reply sent. Message ID: {sent_message['id']}"

        except Exception as e:
            raise Exception(f"Failed to send reply: {e}")

    def _get_thread_id(self, message_id: str) -> str:
        try:
            msg = self.api_resource.users().messages().get(userId='me', id=message_id).execute()
            return msg["threadId"]
        except Exception as e:
            raise Exception(f"Could not retrieve thread ID for message: {e}")
