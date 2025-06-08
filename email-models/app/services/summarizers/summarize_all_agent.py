from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.email_state import EmailState

# Prompt system
system_msg = """Bạn là trợ lý AI có nhiệm vụ tổng hợp nội dung từ email và các tệp đính kèm để tạo một bản tóm tắt rõ ràng, súc tích, dưới dạng các gạch đầu dòng ngắn.

Yêu cầu:
1. Nhận biết chủ đề chính và trình bày trong 1 dòng nếu có thể
2. Chỉ giữ lại thông tin quan trọng nhất, loại bỏ chi tiết không cần thiết
3. Mỗi gạch đầu dòng chỉ nên dài 1 câu ngắn, truyền đạt rõ ràng một ý
4. Không phân loại theo nguồn, chỉ tổng hợp nội dung cốt lõi
5. Giữ đúng ngữ điệu, ngữ cảnh và không suy luận thêm
6. Dịch sang ngôn ngữ do người dùng chỉ định
"""

# Prompt tổng hợp
prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_msg),
    HumanMessagePromptTemplate.from_template(
        "Dữ liệu đầu vào:\n {summaries}\n Ngôn ngữ: {language}\n"
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
        result = self.llm_chain.invoke({"summaries": summaries, "language": state['language']})

        state['final_summary'] = result
        state['current_agent']="SummarizeAll"
        state['done']=True
        return state