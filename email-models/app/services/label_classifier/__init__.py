import os
from langgraph.graph import StateGraph, END
from langchain.chat_models import init_chat_model
from app.services.label_classifier.label_classifer_agent import LabelClassifierAgent
from app.helpers.classify_state import ClassifyState

def create_agent_graph(model_name: str = 'gpt-4o-mini', api_key_type='OPENAI_API_KEY', api_key: str = '',provider:str = 'openai') -> StateGraph:
    # Initialize agents
    os.environ[api_key_type] = api_key
    llm = init_chat_model(model_name,model_provider=provider)
    label_classifier = LabelClassifierAgent(llm)

    # Create classifier workflow
    workflow = StateGraph(ClassifyState)

    # Add agent nodes
    workflow.add_node("LabelClassifier", label_classifier)

    # Define edges
    workflow.add_edge("LabelClassifier", END)

    # Set entry point
    workflow.set_entry_point("LabelClassifier")

    return workflow.compile()