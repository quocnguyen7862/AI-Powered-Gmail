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

def create_agent_graph(gmail_creds,model_name: str = 'gpt-4o-mini', api_key_type='OPENAI_API_KEY', api_key: str = '') -> StateGraph:
    # Gmail API credentials
    api_resource = build_resource_service(gmail_creds)
    toolkit = GmailToolkit(api_resource=api_resource)
    tools = [
        GmailCreateDraft(api_resource=api_resource),
        GmailGetMessage(api_resource=api_resource),
        GmailGetThread(api_resource=api_resource),
    ]

    # Initialize agents
    os.environ[api_key_type] = api_key
    llm = init_chat_model(model_name)
    gmail_chatbot = GamilToolAgent(llm,tools)

    # Create summarizer workflow
    workflow = StateGraph(ChatbotState)

    # Add agent nodes
    workflow.add_node("GmailChatbot", gmail_chatbot)

    # Define edges
    workflow.add_edge("GmailChatbot", END)

    # Set entry point
    workflow.set_entry_point("GmailChatbot")

    return workflow.compile()