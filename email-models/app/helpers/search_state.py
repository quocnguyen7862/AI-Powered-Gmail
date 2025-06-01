from typing import TypedDict, List, Optional
from langgraph.graph import MessagesState

class SearchState(MessagesState):
	emails: List[dict]
