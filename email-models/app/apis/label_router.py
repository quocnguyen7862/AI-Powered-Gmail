from fastapi import APIRouter, HTTPException
from app.services.label_classifier.label_classifer_agent import LabelClassifierAgent
from app.apis.requests.label_request import LabelRequest
from app.apis.requests.email_request import EmailRequest
from app.helpers.classify_state import ClassifyState
from app.services.label_classifier import create_agent_graph

label_router = APIRouter(prefix="/label", tags=["label"])

@label_router.post("/classify-email")
async def classify_email(request: LabelRequest):
    try:
        if not request.summary.strip():
            raise HTTPException(status_code=400, detail="Email content cannot be empty")

        email_text = request.summary.strip()
        user_id = request.user_id

        state = ClassifyState(
            summary=email_text,
            categories=request.labels,
            current_agent="",
            next_agent="LabelClassifier",
            done=False
        )

        # Classify the email
        classify_workflow = create_agent_graph(
            model_name=request.model,
            api_key_type=request.api_key_type,
            api_key=request.api_key
        )

        result = classify_workflow.invoke(state)
        if result['done']:
            label = result['classified_label']
            response = {
                "label": getattr(label, "content", None),
                "metadata": getattr(label, "response_metadata", None),
                "id": getattr(label, "id", None),
                "usage": getattr(label, "usage_metadata", None),
            }
        else:
            raise HTTPException(status_code=500, detail="Workflow did not complete successfully")
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error classifying email: {str(e)}")