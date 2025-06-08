from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.text_splitter import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance
from app.services.summarizers.langgraph_summarize_email import create_agent_graph, EmailState
from app.apis.requests.email_request import EmailRequest
import os
import base64
from app.helpers.classify_state import ClassifyState
from langchain.prompts import PromptTemplate

os.environ["OPENAI_API_KEY"]="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"
qdrant_url = "https://9a368f44-fa95-4264-a4d6-a7d06b2dd09d.europe-west3-0.gcp.cloud.qdrant.io"
qdrant_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.YNgsZPyGE-laFsy5uNNa3ClBK3OseT5f-6E4zg2e3tA"

system_prompt = """
# **Role:**

You are an intelligent AI assistant helping users automatically classify incoming emails. Your goal is to understand the email content and assign it to the most appropriate user-defined label based on the provided label descriptions.

# **Instructions:**

1. Carefully read the email content provided below.
2. Examine the list of user-defined labels and their descriptions.
3. Choose the label that best matches the intent and topic of the email.
4. Respond with **only the label name** that is the best fit.

# **EMAIL CONTENT:**
{email_summary}

# **USER-DEFINED LABELS:**
{labels}

*Each label is defined as a pair of `label_name: description`, for example:*

- `product_enquiry`: Emails asking about product features, pricing, or services.
- `urgent_hr`: Emails related to HR matters that require immediate attention.

# **Notes:**

* Only return the `label_name` that best fits the email.
* Do not invent or infer categories that are not in the list.
* If none of the labels are relevant, respond with `unclassified`.
"""

prompt = PromptTemplate(
    input_variables=["email_summary", "labels"],
    template=system_prompt
)
class LabelClassifierAgent:
    def __init__(self,llm):
        self.llm = llm
        self.llm_chain = prompt|self.llm

    def __call__(self, state:ClassifyState )->dict:
        result = self.llm_chain.invoke({"email_summary":state['summary'],"labels":state['categories']})
        state['classified_label'] = result
        state['current_agent'] = "LabelClassifier"
        state['done'] = True
        return state

