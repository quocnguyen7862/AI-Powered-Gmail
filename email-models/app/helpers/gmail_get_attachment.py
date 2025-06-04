import base64
from email.message import EmailMessage
from typing import List, Optional, Type

from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool
import os
from markitdown import MarkItDown

md = MarkItDown()


class ReadAttachmentSchema(BaseModel):
    message_id: str = Field(..., description="ID of the message containing the attachment.")
    attachment_id: str = Field(..., description="ID of the attachment to read.")
    attachment_name: Optional[str] = Field(None, description="Name of the attachment file (e.g. invoice.pdf).")
    mime_type: Optional[str] = Field(None, description="Expected MIME type of the attachment (e.g. text/plain, application/pdf).")

class GmailReadAttachment(GmailBaseTool):
    name:str = "read_gmail_attachment"
    description:str = "Read the content of an attachment from a Gmail message."
    args_schema: Type[ReadAttachmentSchema] = ReadAttachmentSchema

    def _run(self, message_id: str, attachment_id: str, mime_type: Optional[str] = None, attachment_name: Optional[str] = None,
             run_manager: Optional[CallbackManagerForToolRun] = None) -> str:
        try:
            attachment = self.api_resource.users().messages().attachments().get(
                userId='me', messageId=message_id, id=attachment_id
            ).execute()

            data = attachment.get("data")
            if not data:
                raise Exception("No data found in attachment.")

            save_location = os.getcwd()
            decoded_data = base64.urlsafe_b64decode(data.encode("UTF-8"))
            file_location = os.path.join(save_location,attachment_name)
            with open(file_location, 'wb') as _f:
                _f.write(decoded_data)

            result = md.convert(file_location)
            

            if mime_type and mime_type.startswith("text"):
                return decoded_data.decode("utf-8", errors="replace")
            else:
                return f"Attachment content (base64 decoded):\n{result.markdown[:500]}..."

        except Exception as e:
            raise Exception(f"Failed to read attachment: {e}")