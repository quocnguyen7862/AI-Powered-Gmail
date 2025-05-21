from langgraph.prebuilt import create_react_agent
from helpers.search_state import SearchState
from langchain_core.messages import ToolMessage,AIMessage
import pprint
import json

class SearchAgent:
    def __init__(self,llm,tools):
        self.excutor = create_react_agent(llm, tools)

    def __call__(self, state:SearchState):
        messages = state['messages']
        result = self.excutor.stream({"messages": messages},stream_mode="values")
        last_ai_message = None
        for chunk in result:
            print(pprint.pp(chunk))
            for message in chunk['messages']:
                if isinstance(message, ToolMessage):
                    emails = getattr(message, "content", None)
                    if emails:
                        state['emails'] = json.loads(emails)
                        break
                # if isinstance(message, AIMessage):
                #     last_ai_message = message
        # state['messages']=state['messages'] + [last_ai_message]
        return state