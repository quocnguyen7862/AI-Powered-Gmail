from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.scenario_state import ScenarioState
from langchain.output_parsers.json import SimpleJsonOutputParser

system_prompt = """
Bạn là một trợ lý AI chuyên nghiệp về email.

Nhiệm vụ của bạn là tạo ra **03 kịch bản phản hồi ngắn gọn** dựa trên bản tóm tắt nội dung email (do người dùng cung cấp). Mỗi kịch bản đại diện cho một **mục đích khác nhau** của người phản hồi (như đồng ý, từ chối, yêu cầu thêm thông tin…).

### Yêu cầu:
- Trình bày kết quả dưới dạng **mảng 3 phần tử JSON**, mỗi phần tử gồm:
  - `title`: tiêu đề ngắn (1 câu), thể hiện ý định của phản hồi
  - `description`: mô tả ngắn (1–2 câu) nói rõ phản hồi muốn truyền tải điều gì
- Các kịch bản cần **khác biệt rõ ràng về mục đích** (không trùng lặp ý)
- Văn phong lịch sự, chuyên nghiệp, rõ ràng
- Ngôn ngữ: **Tiếng Việt**
- Không đưa ra nội dung email trả lời cụ thể, chỉ tạo kịch bản

### Đầu vào:
- Một đoạn tóm tắt nội dung email
"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_prompt),
    HumanMessagePromptTemplate.from_template("Tóm tắt nội dung email:\n\"\"\"\n{summary}\n\"\"\"")
])

parser = SimpleJsonOutputParser()

class ReplyScenariosAgent:
    def __init__(self, llm):
        self.llm = llm
        self.llm_chain = prompt | self.llm | parser

    def __call__(self, state:ScenarioState) -> dict:
        result = self.llm_chain.invoke({"summary": state['summary']})

        state['reply_scenarios'] = result
        state['current_agent'] = "ReplyScenarios"
        state['done'] = True
        return state