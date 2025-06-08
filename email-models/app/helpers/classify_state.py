from typing import TypedDict, Optional,List
from langgraph.graph import MessagesState
from langchain_core.messages.human import HumanMessage

class ClassifyState(MessagesState):
    summary: str
    categories: List[str]
    classified_label: str
    current_agent: str
    next_agent: str
    done: bool