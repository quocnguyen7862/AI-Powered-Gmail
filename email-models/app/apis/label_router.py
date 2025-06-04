from fastapi import APIRouter, HTTPException
from app.services.label_classifier.label_classifer_agent import LabelClassifierAgent
from app.apis.requests.label_request import LabelRequest
from app.apis.requests.email_request import EmailRequest

label_router = APIRouter(prefix="/label", tags=["label"])
label_classifier_agent = LabelClassifierAgent()

@label_router.post("/embed-label")
async def label_init(request: LabelRequest):
    try:
        label_classifier_agent.add_label_description(
            request.user_id,
            request.label,
            request.description
        )
        return {"status": "success", "message": "Collection initialized successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing collection: {str(e)}")
    
@label_router.post("/classify-email")
async def classify_email(request: EmailRequest):
    try:
        if not request.email_data.strip():
            raise HTTPException(status_code=400, detail="Email content cannot be empty")

        email_text = request.email_data.strip()
        user_id = request.user_id

        # Classify the email
        label = label_classifier_agent.classify_email(user_id, email_text)

        return {
            "label": label,
            "message": "Email classified successfully."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error classifying email: {str(e)}")