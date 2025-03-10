from fastapi import APIRouter, HTTPException
from app.services.bart_service import BartSummarizationService
from .requests.email_request import EmailRequest

summarize_router = APIRouter(prefix="/summarize", tags=["summarize"])

bart_service = BartSummarizationService()

@summarize_router.post("/bart")
async def bart_summarize(request: EmailRequest):
    try:
        if not request.email_content.strip():
            raise HTTPException(status_code=400, detail="Email content cannot be empty")

        summary = bart_service.summarize(request.email_content)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error summarizing email: {str(e)}")