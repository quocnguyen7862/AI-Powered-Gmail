from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk,SystemMessage
from langchain_core.runnables.config import RunnableConfig
from langgraph.store.base import BaseStore
import uuid
from app.helpers.chatbot_state import ChatbotState

# system_msg = """You are a helpful assistant that can interact with Gmail.
# You can perform actions like searching for emails, creating drafts, and retrieving messages or threads.

# You remember user preferences and provide personalized email suggestions based on past interactions.

# You have access to the following types of memory:

# 1. Short-term memory: The current conversation thread and email being processed.

# 2. Long-term memory: 
#    - Episodic: User-specific patterns and past email replies, such as tone preferences (e.g., "User prefers polite, brief responses to invites", "User usually accepts internal team meetings").
#    - Semantic: General knowledge about email writing conventions, typical response styles, common scenarios (e.g., professional follow-ups, meeting scheduling, marketing inquiries), and the user’s saved label descriptions.

# """

class GamilToolAgent:
    def __init__(self, llm, tools:str,checkpointer):
        self.llm = llm
        self.tools = tools
        self.checkpointer = checkpointer

    def __call__(self, state:ChatbotState,config:RunnableConfig,*,store:BaseStore)->dict:
        system_msg = f"""
        You are a professional AI assistant for a user named {state['user_name']} who interacts with Gmail.

        The user's message may contain:
        - A reference to a Gmail thread in the format:  
        "Id of thread email: <thread_id>"

        - A user request in the format:  
        "User request:\n<instruction>"

        ---

        **Behavior Guidelines**:

        1. **If a thread ID is provided:**
        - Extract the thread ID from the input message.
        - Use the `get_thread` tool to retrieve the conversation.
        - For each message in the thread:
            - Extract sender, subject, and body.
            - If the message contains attachments, use `read_gmail_attachment` to get readable content (e.g., PDF, TXT).
        - Combine all retrieved data into a coherent context before drafting a response.

        2. **If no thread ID is present:**
        - Use the user request alone to generate an appropriate draft or action.

        3. **Tool Usage:**
        - Do not fabricate context. Only reply after tools are used (e.g., `get_thread`, `read_gmail_attachment`) if thread ID is available.
        - Ask for clarification if the user request is too vague or requires more context (e.g., which email to reply to).

        4. **Writing Style:**
        - Replies must be polite, concise, and clearly structured.
        - Limit your output to 3–6 sentences.
        - Avoid including subject lines or email signatures unless explicitly requested.

        ---

        **Example Inputs**:

        **With thread ID:**
        Id of thread email: 18ba123abcd  
        User request:  
        Viết thư xin lỗi vì đã phản hồi chậm và cảm ơn họ đã gửi hợp đồng.

        → Use `get_thread` → extract messages → read attachments if needed → draft reply.

        **Without thread ID:**
        User request:  
        Viết một email xin báo giá dịch vụ bảo trì hệ thống định kỳ.

        → No email context required → just draft email from user intent.

        You always act with awareness of the message structure and tools available.
        """
        human_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
        if not human_messages:
            return state

        try:
            # for result in self.excutor.stream(
            #     {"messages": state["messages"]}, config=config, stream_mode="messages"
            # ):
            #     result_messages = result.get("messages", [])

            #     ai_messages = [
            #         m
            #         for m in result_messages
            #         if isinstance(m, AIMessage) or isinstance(m, AIMessageChunk)
            #     ]
            #     if ai_messages:
            #         agent_response = ai_messages[-1]
            #         # Append only the agent's response to the original state
            #         state["messages"].append(agent_response)
            self.excutor = create_react_agent(model=self.llm, tools=self.tools,prompt=SystemMessage(content=system_msg))
            result = self.excutor.invoke({"messages":state["messages"]},config=config)
            
            result_messages = result.get("messages", [])
            ai_messages = [
                    m
                    for m in result_messages
                    if isinstance(m, AIMessage) or isinstance(m, AIMessageChunk)
                ]
            if ai_messages:
                agent_response = ai_messages[-1]
                state["messages"].append(agent_response)

                user_id = config["configurable"].get("user_id", str(uuid.uuid4()))
                thread_id = config["configurable"].get("thread_id", str(uuid.uuid4()))
                store._redis.lpush(f"{user_id}_{thread_id}", state["user_request"].model_dump_json())
                store._redis.lpush(f"{user_id}_{thread_id}", agent_response.model_dump_json())

        except AttributeError as e:
            raise ValueError("Invalid tool configuration or missing tools") from e
        except Exception as e:
            agent_response = AIMessage(
                content="I'm sorry, I encountered an error processing your request."
            )
            state["messages"].append(agent_response)

        return state