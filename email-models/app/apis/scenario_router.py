from fastapi import APIRouter, HTTPException
from app.apis.requests.scenario_request import ScenarioRequest
from app.services.reply_scenarios.reply_scenarios_agent import ReplyScenariosAgent
from app.services.reply_scenarios import create_agent_graph
from app.helpers.scenario_state import ScenarioState

scenario_router = APIRouter(prefix="/reply-scenarios", tags=["reply_scenario"])

@scenario_router.post("")
async def reply_scenario(request: ScenarioRequest):
    try:
        if not request.summary.strip():
            raise HTTPException(status_code=400, detail="Summary cannot be empty")

        state = ScenarioState(
            summary=request.summary,
            reply_scenarios=[],
            current_agent="",
            next_agent="ReplyScenarios",
            done=False
        )

        # Generate the reply scenario
        scenario_workflow = create_agent_graph(            
            model_name=request.model, 
            api_key_type=request.api_key_type, 
            api_key=request.api_key,
            provider=request.provider
            )
        result = scenario_workflow.invoke(state)
        if result['done']:
            reply_scenarios = result['reply_scenarios']
            response = {
                "reply_scenarios": reply_scenarios,
                "metadata": getattr(reply_scenarios, "response_metadata", None),
                "id": getattr(reply_scenarios, "id", None),
                "usage": getattr(reply_scenarios, "usage_metadata", None),
            }
        else:
            raise HTTPException(status_code=500, detail="Workflow did not complete successfully")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating reply scenario: {str(e)}")