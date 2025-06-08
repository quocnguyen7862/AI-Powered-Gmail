import os
from langgraph.graph import StateGraph, END,MessagesState
from langchain.chat_models import init_chat_model
from app.services.reply_scenarios.reply_scenarios_agent import ReplyScenariosAgent
from app.helpers.scenario_state import ScenarioState


def create_agent_graph(model_name: str = 'gpt-4o-mini', api_key_type='OPENAI_API_KEY', api_key: str = '',provider:str = 'openai') -> StateGraph:
    # Initialize agents
    os.environ[api_key_type] = api_key
    llm = init_chat_model(model_name,model_provider=provider)
    scenario_reply = ReplyScenariosAgent(llm)

    # Create summarizer workflow
    workflow = StateGraph(ScenarioState)

    # Add agent nodes
    workflow.add_node("ScenarioReply", scenario_reply)

    # Define edges
    workflow.add_edge("ScenarioReply", END)

    # Set entry point
    workflow.set_entry_point("ScenarioReply")

    return workflow.compile()