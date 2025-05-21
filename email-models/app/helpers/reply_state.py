from typing import TypedDict, Optional
from langgraph.graph import MessagesState
from langchain_core.messages.human import HumanMessage

class ReplyState(TypedDict):
    message: HumanMessage
    summary: str
    reply: str
    current_agent: str
    next_agent: str
    done: bool