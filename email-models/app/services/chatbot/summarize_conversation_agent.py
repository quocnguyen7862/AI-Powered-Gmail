from helpers.chatbot_state import ChatbotState
from langchain_core.runnables.config import RunnableConfig
from langchain_core.messages import HumanMessage,SystemMessage
from langchain_core.messages import RemoveMessage
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)

MESSAGE_SUMMARIZATION_THRESHOLD = 10

system_prompt = """
You are an email conversation summarizer. Create a concise summary of the recent interaction between the user and the Gmail assistant.

The summary should:
1. Highlight the main topics, user preferences, and key actions taken
2. Include any specific email context (subject lines, senders, intents, or labels applied)
3. Note any unresolved questions or replies that the user postponed
4. Be concise but informative, suitable for future reference or memory retrieval

Format your summary as a short narrative paragraph. Use a neutral, professional tone.
"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_prompt),
    HumanMessagePromptTemplate.from_template("Please summarize this conversation:\n\n{text}")
])

class SummarizeConversationAgent:
    def __init__(self, llm):
        self.llm = llm
        self.llm_chain = prompt | self.llm

    def __call__(self,state: ChatbotState,config: RunnableConfig):
        messages = state["messages"]
        current_message_count = len(messages)
        if current_message_count < MESSAGE_SUMMARIZATION_THRESHOLD:
            return state



        message_content = "\n".join(
            [
                f"{'User' if isinstance(msg, HumanMessage) else 'Assistant'}: {msg.content}"
                for msg in messages
            ]
        )

        # Invoke the summarizer
        summary_response = self.llm_chain.invoke({"text":message_content})


        summary_message = SystemMessage(
            content=f"""
            Summary of the conversation so far:
            
            {summary_response.content}
            
            Please continue the conversation based on this summary and the recent messages.
            """
        )
        remove_messages = [
            RemoveMessage(id=msg.id) for msg in messages if msg.id is not None
        ]

        state["messages"] = [  # type: ignore
            *remove_messages,
            summary_message,
            state["messages"][-1],
        ]

        return state.copy()