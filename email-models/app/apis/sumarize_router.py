from fastapi import APIRouter, HTTPException
from app.apis.requests.email_request import EmailRequest
from app.services.summarizers.langgraph_summarize_email import create_agent_graph, EmailState
import base64

summarize_router = APIRouter(prefix="/summarize-email", tags=["summarize"])

@summarize_router.post("")
async def summarize(request: EmailRequest):
    try:
        if not request.email_data.strip():
            raise HTTPException(status_code=400, detail="Email content cannot be empty")

        decoded_email = base64.urlsafe_b64decode(request.email_data)
        html_content = decoded_email.decode('utf-8')

        state = EmailState(
            language=request.language,
            email_text=html_content,
            email_extracted="",
            email_summary="",
            attachments=request.attachments,
            attachment_summaries=[],
            final_summary="",
            current_agent="",
            next_agent="ExtractMainText",
            done=False
        )

        summary_workflow = create_agent_graph(
            model_name=request.model, 
            api_key_type=request.api_key_type, 
            api_key=request.api_key,
            model_provider=request.provider
        )
        result = summary_workflow.invoke(state)
        if result['done']:
            final_summary = result['final_summary']
            response = {
                "summary": getattr(final_summary, "content", None),
                "metadata": getattr(final_summary, "response_metadata", None),
                "id": getattr(final_summary, "id", None),
                "usage": getattr(final_summary, "usage_metadata", None),
            }
        else:
            raise HTTPException(status_code=500, detail="Workflow did not complete successfully")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing email: {str(e)}")