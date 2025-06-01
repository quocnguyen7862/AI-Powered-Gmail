from typing import TypedDict, List, Optional
from langgraph.graph import MessagesState

class ChatbotState(MessagesState):
	pass
	user_name: Optional[str] = None
