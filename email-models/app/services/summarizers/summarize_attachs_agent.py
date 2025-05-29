from langchain.chains import LLMChain
from markitdown import MarkItDown
import openai
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.email_state import EmailState
import base64
import os

md = MarkItDown()

system_msg = """Bạn là trợ lý AI chuyên tóm tắt tài liệu một cách ngắn gọn và rõ ràng.

Yêu cầu:
1. Nêu rõ mục đích chính của tài liệu
2. Trình bày các luận điểm, dữ kiện, kết luận quan trọng
3. Giữ mạch văn logic và khách quan
4. Không đưa ra nhận xét hoặc thông tin không có trong tài liệu
5. Viết bằng tiếng Việt"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_msg),
    HumanMessagePromptTemplate.from_template("{text}")
])

class SummarizeAttachmentsAgent:
    def __init__(self,llm):
        self.llm=llm
        self.llm_chain = prompt | self.llm

    def __call__(self, state) ->dict:
        try:
            summaries = []

            save_location = os.getcwd()

            # for file in state['attachments']:
            #     file_decoded = base64.urlsafe_b64decode(file['data'].encode('utf-8'))
            #     file_location = os.path.join(save_location, file['filename'])
            #     with open(file_location,'wb') as _f:
            #         _f.write(file_decoded)

            for file in state['attachments']:
                file_decoded = base64.urlsafe_b64decode(file['data'].encode('utf-8'))
                file_location = os.path.join(save_location, file['filename'])
                with open(file_location,'wb') as _f:
                    _f.write(file_decoded)

                result = md.convert(file_location)
                summary = self.llm_chain.invoke({"text": result.markdown})
                summaries.append(summary)

                try:
                    os.remove(file_location)
                except Exception as e:
                    print(f"Error removing file {file_location}: {str(e)}")
            
            state['attachment_summaries']=summaries
            return state
        except Exception as e:
            raise e