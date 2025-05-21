import os
from langgraph.graph import StateGraph, END,MessagesState
from langchain.chat_models import init_chat_model
from services.search.search_agent import SearchAgent
from helpers.search_state import SearchState
from langchain_community.agent_toolkits.gmail.toolkit import GmailToolkit
from langchain_community.tools.gmail.utils import build_resource_service
from langchain_community.tools.gmail.search import GmailSearch

def create_agent_graph(gmail_creds,model_name: str = 'gpt-4o-mini', api_key_type='OPENAI_API_KEY', api_key: str = '') -> StateGraph:
    # Gmail API credentials
    api_resource = build_resource_service(gmail_creds)
    toolkit = GmailToolkit(api_resource=api_resource)
    tools = [
        GmailSearch(api_resource=api_resource),
    ]

    # Initialize agents
    os.environ[api_key_type] = api_key
    llm = init_chat_model(model_name)
    search_agent = SearchAgent(llm,tools)

    # Create summarizer workflow
    workflow = StateGraph(SearchState)

    # Add agent nodes
    workflow.add_node("SearchAgent", search_agent)

    # Define edges
    workflow.add_edge("SearchAgent", END)

    # Set entry point
    workflow.set_entry_point("SearchAgent")

    return workflow.compile()