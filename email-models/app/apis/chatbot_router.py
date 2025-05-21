from fastapi import APIRouter, HTTPException
from .requests.chatbot_request import ChatbotRequest
from services.chatbot import create_agent_graph
from app.helpers.chatbot_state import ChatbotState
from langchain_core.messages.human import HumanMessage
from langchain_community.tools.gmail.utils import get_gmail_credentials
import os
import json

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
            messages=[HumanMessage(request.message)],
        )

        chatbot_workflow = create_agent_graph(
            creds,
            model_name=request.model,
            api_key_type= request.api_key_type,
            api_key=request.api_key
        )

        result = chatbot_workflow.invoke(state)
        reply = result['messages'][-1]
        response = {
            "output": getattr(reply, "content", None),
            "metadata": getattr(reply, "response_metadata", None),
            "id": getattr(reply, "id", None),
            "usage": getattr(reply, "usage_metadata", None),
        }
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error chatbot: {str(e)}")