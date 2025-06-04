from langgraph.prebuilt import create_react_agent
from langchain_core.messages import ToolMessage,AIMessage,SystemMessage
import pprint
import json
from app.helpers.search_state import SearchState

system_msg = f"""
You are a helpful assistant with access to Gmail.

Your sole task is to **search for emails** that match the user's request and return them.

Instructions:
- Focus only on searching emails. Ignore requests unrelated to search.
- If relevant emails are found, always return their full details, including:
    - Sender
    - Subject
    - Date
    - Snippet or preview of content
- If no emails are found, reply clearly that nothing relevant was found.
- Do not generate summaries, suggestions, or take any other actions.
"""

class SearchAgent:

    def __init__(self,llm,tools):
        self.excutor = create_react_agent(model=llm,tools=tools,prompt=SystemMessage(content=system_msg))

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