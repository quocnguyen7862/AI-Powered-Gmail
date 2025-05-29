from fastapi import APIRouter, HTTPException
from .requests.model_request import ModelRequest
from langchain.chat_models import init_chat_model
from langchain_core.messages.human import HumanMessage
import os

model_router = APIRouter(prefix="/model", tags=["model"])

@model_router.post("/check")
async def check_model(request:ModelRequest):
    try:
        os.environ[request.api_key_type] = request.api_key
        llm = init_chat_model(request.model,model_provider=request.provider)
        llm.invoke([HumanMessage("ping")])

        return {
            "status": "success",
            "message": f"Model {request.model} is available."
        }
    except Exception as e:
        raise HTTPException(status_code=e.status_code,detail=e.body['message'])
        