from typing import TypedDict, Optional,List
from langgraph.graph import MessagesState
from langchain_core.messages.human import HumanMessage

class ReplyState(MessagesState):
    pass
    message: HumanMessage
    summary: str
    user_name: Optional[str] = None
    attachments: List[str] = []
    attachment_summaries: List[str] = []