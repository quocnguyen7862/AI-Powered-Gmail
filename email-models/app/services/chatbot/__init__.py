import os
from langgraph.graph import StateGraph, END
from langchain.chat_models import init_chat_model
from services.chatbot.gmail_tools_agent import GamilToolAgent
from helpers.chatbot_state import ChatbotState
from langchain_community.agent_toolkits.gmail.toolkit import GmailToolkit
from langchain_community.tools.gmail.utils import build_resource_service
from langchain_community.tools.gmail.create_draft import GmailCreateDraft
from langchain_community.tools.gmail.get_message import GmailGetMessage
from langchain_community.tools.gmail.get_thread import GmailGetThread
from services.chatbot.summarize_conversation_agent import SummarizeConversationAgent
from langgraph.store.redis import RedisStore
from langgraph.store.base import BaseStore
from langgraph.checkpoint.redis import RedisSaver
from helpers.redis_memory import store_memory_tool, retrieve_memories_tool,redis_client,REDIS_URL
from helpers.gmail_delete_draft import GmailDeleteDraft
from helpers.gmail_assign_label import GmailAddLabelByName
from helpers.gmail_create_label import GmailCreateLabel
from helpers.gmail_delete_email import GmailTrashThread,GmailUntrashThread
from helpers.gmail_delete_label import GmailDeleteLabel
from helpers.gmail_list_label import GmailListLabels
from helpers.gmail_send_email import GmailSendEmail
from helpers.gmail_unassign_label import GmailRemoveLabelByName
from helpers.gmail_get_attachment import GmailReadAttachment
from helpers.gmail_get_draft import GmailGetDraft
from helpers.gmail_list_draft import GmailListDrafts
from helpers.gmail_update_draft import GmailUpdateDraft
from helpers.gmail_search import GmailSearch

with (RedisStore.from_conn_string(REDIS_URL) as store,
      RedisSaver.from_conn_string(REDIS_URL) as checkpointer):
    store.setup()
    checkpointer.setup()

    def create_agent_graph(gmail_creds,model_name: str = 'gpt-4o-mini', api_key_type='OPENAI_API_KEY', api_key: str = '') -> StateGraph:
        # Gmail API credentials
        api_resource = build_resource_service(gmail_creds)
        toolkit = GmailToolkit(api_resource=api_resource)
        tools = [
            GmailCreateDraft(api_resource=api_resource),
            GmailGetMessage(api_resource=api_resource),
            GmailGetThread(api_resource=api_resource),
            GmailSearch(api_resource=api_resource),
            GmailDeleteDraft(api_resource=api_resource),
            GmailAddLabelByName(api_resource=api_resource),
            GmailCreateLabel(api_resource=api_resource),
            GmailTrashThread(api_resource=api_resource),
            GmailDeleteLabel(api_resource=api_resource),
            GmailListLabels(api_resource=api_resource),
            GmailSendEmail(api_resource=api_resource),
            GmailRemoveLabelByName(api_resource=api_resource),
            GmailReadAttachment(api_resource=api_resource),
            GmailGetDraft(api_resource=api_resource),
            GmailListDrafts(api_resource=api_resource),
            GmailUpdateDraft(api_resource=api_resource),
            GmailUntrashThread(api_resource=api_resource),
        ]

        # Initialize agents
        os.environ[api_key_type] = api_key
        llm = init_chat_model(model_name)
        gmail_chatbot = GamilToolAgent(llm,tools,checkpointer=checkpointer)
        summarize_conversation = SummarizeConversationAgent(llm)

        workflow = StateGraph(ChatbotState)

        # Add agent nodes
        workflow.add_node("GmailChatbot", gmail_chatbot)
        workflow.add_node("SummarizeConversation", summarize_conversation)

        # Define edges
        workflow.add_edge("GmailChatbot", "SummarizeConversation")
        workflow.add_edge("SummarizeConversation", END)

        # Set entry point
        workflow.set_entry_point("GmailChatbot")

        return workflow.compile(checkpointer=checkpointer, store=store)