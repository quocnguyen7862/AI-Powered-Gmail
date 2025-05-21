import os
from langgraph.graph import StateGraph, END
from langchain.chat_models import init_chat_model
from app.services.summarizers.extract_email_agent import ExtractEmailAgent
from app.services.summarizers.summarize_all_agent import SummarizeAllAgent
from app.services.summarizers.summarize_attachs_agent import SummarizeAttachmentsAgent
from app.services.summarizers.summarize_email_agent import SummarizeEmailAgent
from app.helpers.email_state import EmailState

# Initialize agents

def create_agent_graph(model_name: str = 'gpt-4o-mini',api_key_type='OPENAI_API_KEY', api_key:str='') -> StateGraph:
    # Initialize agents
    os.environ[api_key_type] = api_key
    llm = init_chat_model(model_name)
    extract_email = ExtractEmailAgent(llm)
    summarize_email = SummarizeEmailAgent(llm)
    summarize_attachments = SummarizeAttachmentsAgent(llm)
    summarize_all = SummarizeAllAgent(llm)

    # Create summarizer workflow
    workflow = StateGraph(EmailState)

    # Add agent nodes
    workflow.add_node("ExtractMainText", extract_email)
    workflow.add_node("SummarizeEmail", summarize_email)
    workflow.add_node("SummarizeAttachments", summarize_attachments)
    workflow.add_node("SummarizeAll", summarize_all)

    # Define edges
    workflow.add_edge("ExtractMainText", "SummarizeEmail")
    workflow.add_conditional_edges(
        "SummarizeEmail",
        check_attachments
    )
    workflow.add_edge("SummarizeAttachments", "SummarizeAll")
    workflow.add_edge("SummarizeAll", END)

    # Set entry point
    workflow.set_entry_point("ExtractMainText")
    
    return workflow.compile()

def should_continue(state: EmailState) -> str:
    if state['done']:
        return END
    return state['next_agent']

def check_attachments(state: EmailState):
    if state['attachments'] and len(state['attachments']) > 0:
        return "SummarizeAttachments"
    return "SummarizeAll"