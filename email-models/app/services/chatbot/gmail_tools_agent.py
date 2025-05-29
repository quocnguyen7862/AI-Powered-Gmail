from langgraph.prebuilt import create_react_agent
from helpers.chatbot_state import ChatbotState
from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk,SystemMessage
from langchain_core.runnables.config import RunnableConfig

system_msg = """You are a helpful assistant that can interact with Gmail.
You can perform actions like searching for emails, creating drafts, and retrieving messages or threads.

You remember user preferences and provide personalized email suggestions based on past interactions.

You have access to the following types of memory:

1. Short-term memory: The current conversation thread and email being processed.

2. Long-term memory: 
   - Episodic: User-specific patterns and past email replies, such as tone preferences (e.g., "User prefers polite, brief responses to invites", "User usually accepts internal team meetings").
   - Semantic: General knowledge about email writing conventions, typical response styles, common scenarios (e.g., professional follow-ups, meeting scheduling, marketing inquiries), and the user’s saved label descriptions.

"""

class GamilToolAgent:
    def __init__(self, llm, tools,checkpointer):
        self.excutor = create_react_agent(model=llm, tools=tools,prompt=SystemMessage(content=system_msg))

    def __call__(self, state:ChatbotState,config:RunnableConfig):
        human_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
        if not human_messages:
            return state

        try:
            for result in self.excutor.stream(
                {"messages": state["messages"]}, config=config, stream_mode="messages"
            ):
                result_messages = result.get("messages", [])

                ai_messages = [
                    m
                    for m in result_messages
                    if isinstance(m, AIMessage) or isinstance(m, AIMessageChunk)
                ]
                if ai_messages:
                    agent_response = ai_messages[-1]
                    # Append only the agent's response to the original state
                    state["messages"].append(agent_response)

        except Exception as e:
            agent_response = AIMessage(
                content="I'm sorry, I encountered an error processing your request."
            )
            state["messages"].append(agent_response)
        return state