import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool


class SendEmailSchema(BaseModel):
    """Input schema for sending a Gmail message."""
    message: str = Field(..., description="The plain text body of the email.")
    to: List[str] = Field(..., description="The list of recipients.")
    subject: str = Field(..., description="The subject line of the email.")
    cc: Optional[List[str]] = Field(None, description="CC recipients.")
    bcc: Optional[List[str]] = Field(None, description="BCC recipients.")


class GmailSendEmail(GmailBaseTool):
    """Tool to send an email via Gmail."""

    name: str = "send_gmail_email"
    description: str = "Use this tool to send an email immediately with the specified fields."
    args_schema: Type[SendEmailSchema] = SendEmailSchema

    def _prepare_send_message(
        self,
        message: str,
        to: List[str],
        subject: str,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> dict:
        email = EmailMessage()
        email.set_content(message)
        email["To"] = ", ".join(to)
        email["Subject"] = subject

        if cc:
            email["Cc"] = ", ".join(cc)
        if bcc:
            email["Bcc"] = ", ".join(bcc)

        encoded = base64.urlsafe_b64encode(email.as_bytes()).decode()
        return {"raw": encoded}

    def _run(
        self,
        message: str,
        to: List[str],
        subject: str,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        try:
            send_message = self._prepare_send_message(message, to, subject, cc, bcc)
            result = (
                self.api_resource.users()
                .messages()
                .send(userId="me", body=send_message)
                .execute()
            )
            return f"Email sent successfully. Message ID: {result['id']}"
        except Exception as e:
            raise Exception(f"Failed to send email: {e}")
