from langchain.chat_models import init_chat_model
from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.email_state import EmailState

system_msg = """
Bạn là một trợ lý AI chuyên tóm tắt email một cách ngắn gọn và rõ ràng.

Nhiệm vụ:
1. Tóm tắt mục đích chính của email
2. Liệt kê thông tin quan trọng: yêu cầu, thời hạn, địa điểm, người liên quan
3. Duy trì giọng điệu và ngữ cảnh gốc

Yêu cầu:
- Trình bày đoạn văn (không dùng bullet)
- Giữ nội dung 3–5 câu, rõ ràng, mạch lạc
- Bỏ qua chào hỏi và chữ ký
"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_msg),
    HumanMessagePromptTemplate.from_template("{text}")
])

class SummarizeEmailAgent:
    def __init__(self,llm):
        self.llm=llm
        self.llm_chain = prompt | self.llm

    def __call__(self,state:EmailState) ->dict:
        result = self.llm_chain.invoke({"text": state['email_extracted']})
        state['email_summary']=result
        state['current_agent']="SummarizeEmail"
        state['next_agent']="SummarizeAttachments"
        return state

if __name__ == "__main__":
    # Ví dụ email
    email_content = """
        Chào mừng Đức Quốc gia nhập Prima Solutions. Bạn cần mang theo CMND/CCCD, bằng cấp liên quan (photo) và laptop cá nhân. Các bước cần thực hiện bao gồm đăng nhập các nền tảng của công ty (Prima Channel, TGL Workspace, Prima NextCloud) sử dụng tài khoản Prima Channel đã được gửi qua email. Sau đó, truy cập Prima Channel, vào Avatar, chọn "Process New Comer" để đọc và thực hiện theo hướng dẫn. Lịch trình Prima First Day Orientation sẽ được thông báo sau. Tiếp theo là ký các hồ sơ trực tiếp với Nhân sự, bàn giao thiết bị (nếu có), ký thỏa thuận BMTT, giới thiệu với mọi người và được quản lý trực tiếp/PL hướng dẫn tham gia vào dự án liên quan. Tài liệu này là thông tin bảo mật, dành cho người mới của Prima Solutions.,Kính gửi Đức Quốc,

        Thay mặt công ty, tôi gửi bạn quy trình gia nhập Prima Solutions. Trong email này có file PDF chứa thông tin về tiếp nhận nhân sự mới. Cảm ơn bạn đã quan tâm đến cơ hội việc làm tại Prima Solutions.

        Trân trọng,

        Nhan Nguyễn
        Phòng Nhân Sự
        ☎️ (+84) 342 866 402
        📧 hr@prima-sol.com
        📍 Văn phòng 01 Trần Văn Kỷ, Liên Chiểu, Đà Nẵng
            """
    