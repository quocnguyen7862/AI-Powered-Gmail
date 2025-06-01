from typing import Optional, Type
from pydantic import BaseModel, Field
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_community.tools.gmail.base import GmailBaseTool

class DeleteDraftSchema(BaseModel):
    """Input schema for deleting a Gmail draft."""
    draft_id: str = Field(..., description="The unique ID of the draft email, retrieved from a search.")

class GmailDeleteDraft(GmailBaseTool):
    """Tool to delete a draft email from Gmail."""

    name: str = "delete_gmail_draft"
    description: str = "Use this tool to delete a draft email by its ID."
    args_schema: Type[DeleteDraftSchema] = DeleteDraftSchema

    def _run(
        self,
        draft_id: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        try:
            self.api_resource.users().drafts().delete(
                userId="me", id=draft_id
            ).execute()
            return f"Draft with ID {draft_id} has been deleted successfully."
        except Exception as e:
            raise Exception(f"Failed to delete draft: {e}")