from typing import TypedDict, List, Optional
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage

class ChatbotState(MessagesState):
	pass
	user_name: Optional[str] = None
	user_request: Optional[HumanMessage] = None
