from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.email_state import EmailState
from app.helpers.custom_markdownify_transformer import CustomMarkdownifyTransformer
from langchain_community.document_transformers import MarkdownifyTransformer
from typing import Sequence
from langchain_core.documents import Document

system_msg = """
Bạn sẽ được cung cấp nội dung của một email. Nội dung này có thể bao gồm:

- Phần văn bản mới do người gửi vừa soạn
- Phần trích dẫn lại nội dung các email trước đó (reply, forward) nằm trong quote
- Chữ ký cá nhân của người gửi

Nhiệm vụ của bạn là:
1. Trích ra **toàn bộ phần văn bản do người gửi mới soạn**, bao gồm cả phần chữ ký cá nhân nếu có.
2. **Bỏ qua tất cả các đoạn nằm trong quote hoặc reply chain**.
3. Giữ nguyên định dạng gốc của nội dung còn lại, không thêm lời giải thích.

Trả về phần nội dung mới nhất do người gửi viết.
"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_msg),
    HumanMessagePromptTemplate.from_template("{text}")
])

md = MarkdownifyTransformer()

class ExtractEmailAgent:
    def __init__(self, llm):
        self.llm = llm
        self.llm_chain = prompt | self.llm

    def __call__(self,state:EmailState) ->dict:
        document=Document(page_content=state['email_text'], metadata={})
        documents= [document]
        converted_docs  = md.transform_documents(documents)
        result = self.llm_chain.invoke({"text": state['email_text']})

        state['email_extracted']=result
        state['current_agent']="ExtractMainText"
        state['next_agent']="SummarizeEmail"
        return state
