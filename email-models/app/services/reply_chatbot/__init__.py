import os
from langgraph.graph import StateGraph, END,START
from langchain.chat_models import init_chat_model
from app.helpers.reply_state import ReplyState
from langgraph.prebuilt import ToolNode
from helpers.mongodb_tool import get_email_summary
from services.reply_chatbot.generate_reply_agent import GenerateReplyAgent
from langgraph.checkpoint.redis import RedisSaver
from langgraph.store.redis import RedisStore
from services.summarizers.summarize_attachs_agent import SummarizeAttachmentsAgent

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

with (RedisStore.from_conn_string(REDIS_URL) as store,
      RedisSaver.from_conn_string(REDIS_URL) as checkpointer):
    store.setup()
    checkpointer.setup()

    def create_agent_graph(model_name: str = 'gpt-4o-mini', api_key_type='OPENAI_API_KEY', api_key: str = '') -> StateGraph:
        # Initialize agents
        os.environ[api_key_type] = api_key
        llm = init_chat_model(model_name)
        llm_with_tool = llm.bind_tools([get_email_summary])

        generate_reply = GenerateReplyAgent(llm)
        summarize_attachments = SummarizeAttachmentsAgent(llm)

        # Create summarizer workflow
        workflow = StateGraph(ReplyState)

        # Add agent nodes
        workflow.add_node("SummarizeAttachments", summarize_attachments)
        workflow.add_node("GenerateReply", generate_reply)

        # Define edges
        workflow.add_conditional_edges(
            "SummarizeAttachments",
            check_attachments
        )
        # workflow.add_edge("SummarizeAttachments", "GenerateReply")
        workflow.add_edge("GenerateReply", END)

        # Set entry point
        workflow.set_entry_point("SummarizeAttachments")

        return workflow.compile(store=store,checkpointer=checkpointer)

    def should_continue(state:ReplyState):
        messages = state['messages']
        last_message = messages[-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END
    
    def check_attachments(state: ReplyState):
        if state['attachments'] and len(state['attachments']) > 0:
            return "GenerateReply"
        return "GenerateReply"