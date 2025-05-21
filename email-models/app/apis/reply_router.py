from fastapi import APIRouter, HTTPException
from .requests.reply_request import ReplyRequest
from services.reply_chatbot import create_agent_graph
from app.helpers.reply_state import ReplyState
from langchain_core.messages.human import HumanMessage

reply_router = APIRouter(prefix="/reply-generate", tags=["reply_generate"])

@reply_router.post("")
async def reply_generate(request: ReplyRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Mesgage cannot be empty")

        state = ReplyState(
            message=HumanMessage(request.message),
            summary=request.summary,
            current_agent="",
            next_agent="GenerateReply",
            done=False
        )

        # Generate the reply scenario
        replay_workflow  = create_agent_graph(
            model_name=request.model, 
            api_key_type=request.api_key_type, 
            api_key=request.api_key,
            draft_id=request.draft_id)
        
        result = replay_workflow .invoke(state)
        if result['done']:
            reply = result['reply']
            response = {
                "output": getattr(reply, "content", None),
                "metadata": getattr(reply, "response_metadata", None),
                "id": getattr(reply, "id", None),
                "usage": getattr(reply, "usage_metadata", None),
            }
        else:
            raise HTTPException(status_code=500, detail="Workflow did not complete successfully")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating reply: {str(e)}")