from langgraph.prebuilt import create_react_agent
from helpers.chatbot_state import ChatbotState

class GamilToolAgent:
    def __init__(self, llm, tools):
        self.excutor = create_react_agent(llm, tools)

    def __call__(self, state:ChatbotState):
        messages = state['messages']
        result = self.excutor.invoke({"messages": messages},stream_mode="values")
        state['messages']=state['messages'] + [result["messages"][-1]]
        return state