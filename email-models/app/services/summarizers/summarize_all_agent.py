from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.email_state import EmailState

# Prompt system
system_msg = """Bạn là trợ lý AI có nhiệm vụ tổng hợp nội dung từ email và các tệp đính kèm để tạo một bản tóm tắt duy nhất, rõ ràng và mạch lạc.

Yêu cầu:
1. Nhận biết chủ đề chính của toàn bộ thông điệp
2. Trình bày các thông tin quan trọng theo thứ tự ưu tiên
3. Tạo đoạn văn duy nhất, không phân loại theo nguồn
4. Giữ đúng giọng điệu, ngữ cảnh và không bổ sung suy luận cá nhân
5. Viết bằng tiếng Việt"""

# Prompt tổng hợp
prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_msg),
    HumanMessagePromptTemplate.from_template(
        "Dữ liệu đầu vào:\n {summaries}\n"
    )
])

class SummarizeAllAgent:
    def __init__(self,llm):
        self.llm=llm
        self.llm_chain = prompt | self.llm

    def __call__(self, state:EmailState) ->dict:
        # Kết hợp nội dung email và tóm tắt các tệp đính kèm
        summaries = state['email_summary'] + state['attachment_summaries']

        # Tạo tóm tắt cuối cùng
        result = self.llm_chain.invoke({"summaries": summaries})

        state['final_summary'] = result
        state['current_agent']="SummarizeAll"
        state['done']=True
        return state