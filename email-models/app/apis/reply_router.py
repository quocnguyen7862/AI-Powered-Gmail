from fastapi import APIRouter, HTTPException
from .requests.reply_request import ReplyRequest
from services.reply_chatbot import create_agent_graph
from app.helpers.reply_state import ReplyState
from langchain_core.messages.human import HumanMessage
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk,SystemMessage

reply_router = APIRouter(prefix="/reply-generate", tags=["reply_generate"])

@reply_router.post("")
async def reply_generate(request: ReplyRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Mesgage cannot be empty")

        state = ReplyState(
            # messages=[HumanMessage(f"Tóm tắt: {request.summary}\n\nYêu cầu: {request.message}")],
            message=HumanMessage(request.message),
            summary=request.summary,
            user_name=request.user_name or "Người dùng",
            attachments=request.attachments
        )

        # Generate the reply scenario
        replay_workflow  = create_agent_graph(
            model_name=request.model, 
            api_key_type=request.api_key_type, 
            api_key=request.api_key,
            draft_id=request.draft_id)
        
        config = RunnableConfig(configurable={"thread_id": request.draft_id})
        
        result = replay_workflow .invoke(state,config=config)
        result_messages = result.get("messages", [])
        ai_messages = [
            m
            for m in result_messages
            if isinstance(m, AIMessage) or isinstance(m, AIMessageChunk)
        ]
        if ai_messages:
            agent_response = ai_messages[-1]
            response = {
                "output": getattr(agent_response, "content", None),
                "metadata": getattr(agent_response, "response_metadata", None),
                "id": getattr(agent_response, "id", None),
                "usage": getattr(agent_response, "usage_metadata", None),
            }
            return response
        else:
            raise HTTPException(status_code=500, detail="Workflow did not complete successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating reply: {str(e)}")