from typing import TypedDict, List
from langgraph.graph import MessagesState

class SearchState(MessagesState):
	emails: List[dict]
