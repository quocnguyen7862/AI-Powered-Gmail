from fastapi import APIRouter, HTTPException
from app.apis.requests.chatbot_request import ChatbotRequest
from app.services.chatbot import create_agent_graph
from app.helpers.chatbot_state import ChatbotState
from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk,SystemMessage
from langchain_community.tools.gmail.utils import get_gmail_credentials
from langchain_core.runnables import RunnableConfig
import os
import json
import pprint

chatbot_router = APIRouter(prefix="/chatbot", tags=["chatbot"])
static_location = os.path.join(os.getcwd(), "app/static/credentials.json")
token_dir = os.path.join(os.getcwd(), "app/user_tokens/")

@chatbot_router.post("")
async def chatbot(request: ChatbotRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        token_location = os.path.join(token_dir,request.user_id+".json")
        token = {
            "refresh_token": request.refresh_token,
            "expiry_date": request.expiry_date,
            "access_token": request.access_token,
            "token_type": request.token_type,
            "id_token": request.id_token,
            "client_id": request.client_id,
            "client_secret": request.client_secret,
        }
        with open(token_location,"wb") as _f:
            _f.write(json.dumps(token).encode("utf-8"))


        creds = get_gmail_credentials(
            scopes=request.scope.split(" "),
            client_secrets_file=static_location,
            token_file=token_location,
        )

        state = ChatbotState(
            messages=[HumanMessage(content=f"Id of thread email: {request.email_id}\n\n"
                                   f"User request: \n{request.message}")],
            user_name=request.user_name or "Không có tên người dùng",
        )

        chatbot_workflow = create_agent_graph(
            creds,
            model_name=request.model,
            api_key_type= request.api_key_type,
            api_key=request.api_key,
        )

        config = RunnableConfig(configurable={"thread_id":request.thread_id,"user_id":request.user_id})

        result = chatbot_workflow.invoke(state,config=config)
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
        raise HTTPException(status_code=500, detail=f"Error chatbot: {str(e)}")