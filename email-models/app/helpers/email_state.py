from typing import TypedDict, List

class EmailState(TypedDict):
    email_text: str
    email_extracted: str
    email_summary: str
    attachments: List[str]
    attachment_summaries: List[str]
    final_summary: str
    current_agent: str
    next_agent: str
    done: bool