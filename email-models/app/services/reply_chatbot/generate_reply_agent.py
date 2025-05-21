from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.reply_state import ReplyState
from helpers.redis_memory import redis_memory
from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from langgraph.store.base import BaseStore
from langchain_core.runnables import RunnableConfig
import uuid

system_prompt = """
Bạn là một trợ lý AI chuyên nghiệp hỗ trợ người dùng soạn và phản hồi email bằng tiếng Việt.

- Nếu có tóm tắt email trước đó, hãy dùng làm ngữ cảnh trả lời.
- Nếu chỉ có yêu cầu người dùng, hãy hỗ trợ họ soạn nội dung email phù hợp.

Nguyên tắc:
- Trình bày rõ ràng, mạch lạc, lịch sự.
- Không viết tiêu đề hoặc chữ ký.
- Phản hồi gồm 3–6 câu.
"""

prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(system_prompt),
    HumanMessagePromptTemplate.from_template("Tóm tắt: {summary}\n\nYêu cầu: {user_request}")
])

class GenerateReplyAgent:
    def __init__(self, llm, draft_id:str):
        self.llm = llm
        self.llm_chain = prompt | self.llm
        self.draft_id = draft_id
    
    def __call__(self, state: ReplyState,config:RunnableConfig,*,store:BaseStore) -> dict:
        # user_id = config["configurable"]['user_id']
        namespace = ('memories')
        # store.put(namespace, str(uuid.uuid4()), state['message'].to_json())
        store._redis.lpush(self.draft_id, state['message'].model_dump_json())

        message = getattr(state["message"], "content")
        result = self.llm_chain.invoke({"user_request": message,"summary":state["summary"] or "Không có"})
        # store.put(namespace, str(uuid.uuid4()), result.to_json())
        store._redis.lpush(self.draft_id, result.model_dump_json())

        state['reply'] = result
        state['current_agent'] = "GenerateReply"
        state['done'] = True
        return state