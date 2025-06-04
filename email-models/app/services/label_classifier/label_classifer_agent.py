from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.text_splitter import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance
from app.services.summarizers.langgraph_summarize_email import create_agent_graph, EmailState
from app.apis.requests.email_request import EmailRequest
import os
import base64

os.environ["OPENAI_API_KEY"]="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"
qdrant_url = "https://9a368f44-fa95-4264-a4d6-a7d06b2dd09d.europe-west3-0.gcp.cloud.qdrant.io"
qdrant_api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.YNgsZPyGE-laFsy5uNNa3ClBK3OseT5f-6E4zg2e3tA"

class LabelClassifierAgent:
    def __init__(self,similarity_threshold=0.8):
        self.embedding= OpenAIEmbeddings(model="text-embedding-3-small")
        self.qdrant_client = QdrantClient(url=qdrant_url,api_key=qdrant_api_key,port=6333)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        self.similarity_threshold = similarity_threshold

    def get_collection_name(self, user_id:str)->str:
        return f"label_classifier_{user_id}"
    
    def init_collection(self, user_id:str):
        collection_name = self.get_collection_name(user_id)
        existing_collections = self.qdrant_client.get_collections().collections
        if not any(c.name == collection_name for c in existing_collections):
            self.qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
            )

    def add_label_description(self, user_id:str, label:str, description:str):
        self.init_collection(user_id)

        docs = self.text_splitter.create_documents([description])
        for doc in docs:
            doc.metadata = {"label":label,"user_id":user_id}
        vector_store = Qdrant(
            client=self.qdrant_client,
            collection_name=self.get_collection_name(user_id),
            embeddings=self.embedding
        )
        vector_store.add_documents(docs)

    def summarize_email(self,request:EmailRequest)->str:
        decoded_email = base64.urlsafe_b64decode(request.email_data)
        html_content = decoded_email.decode('utf-8')

        state = EmailState(
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
        )
        result = summary_workflow.invoke(state)
        if result['done']:
            final_summary = result['final_summary']
        return getattr(final_summary, "content", None)
    
    def classify_email(self,email:EmailRequest,user_id:str)->str:
        summary = self.summarize_email(email)
        vector_store = Qdrant(
            client=self.qdrant_client,
            collection_name=self.get_collection_name(user_id),
            embeddings=self.embedding
        )

        results = vector_store.similarity_search_with_score(summary,k=1)

        if results:
            best_result = results[0]
            label = best_result[0].metadata["label"]
            score = best_result[1]
            if score >= self.similarity_threshold:
                return label, score
            

        if not results:
            return None, 0.0
        label= results[0][0].metadata["label"]
        score = results[0][1]
        return label, score

