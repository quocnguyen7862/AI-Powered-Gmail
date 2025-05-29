from langchain.prompts.chat import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)
from app.helpers.reply_state import ReplyState
from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from langgraph.store.base import BaseStore
from langchain_core.runnables import RunnableConfig
import uuid
from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk,SystemMessage
from langgraph.prebuilt import create_react_agent

# system_prompt = """
# Bạn là một trợ lý AI chuyên nghiệp hỗ trợ người dùng soạn và phản hồi email bằng tiếng Việt.

# - Nếu có tóm tắt email trước đó, hãy dùng làm ngữ cảnh trả lời.
# - Nếu chỉ có yêu cầu người dùng, hãy hỗ trợ họ soạn nội dung email phù hợp.

# Nguyên tắc:
# - Trình bày rõ ràng, mạch lạc, lịch sự.
# - Không viết tiêu đề hoặc chữ ký.
# - Phản hồi gồm 3–6 câu.
# """

# prompt = ChatPromptTemplate.from_messages([
#     SystemMessagePromptTemplate.from_template(system_prompt),
#     HumanMessagePromptTemplate.from_template("Tóm tắt: {summary}\n\nYêu cầu: {user_request}")
# ])

class GenerateReplyAgent:
    def __init__(self, llm, draft_id:str):
        self.llm = llm
        # self.llm_chain = create_react_agent(model=llm,prompt=SystemMessage(content=system_prompt),tools=[])
        self.draft_id = draft_id
    
    def __call__(self, state: ReplyState,config:RunnableConfig,*,store:BaseStore) -> dict:
        system_prompt = f"""
        Bạn là một trợ lý AI chuyên nghiệp của người dùng có tên là {state['user_name']}, nhiệm vụ của bạn là hỗ trợ người dùng soạn và phản hồi email.

        - Nếu có tóm tắt email trước đó hoặc tóm tắt của attachment, hãy dùng làm ngữ cảnh trả lời.
        - Nếu chỉ có yêu cầu người dùng, hãy hỗ trợ họ soạn nội dung email phù hợp.

        Nguyên tắc:
        - Trình bày rõ ràng, mạch lạc, lịch sự.
        - Không viết tiêu đề hoặc chữ ký.
        - Phản hồi gồm 3–6 câu.
        """

        # human_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
        # if not human_messages:
        #     return state
            
        store._redis.lpush(self.draft_id, state['message'].model_dump_json())

        try:
            # result = self.llm.invoke([{"role":"system","content":system_prompt}]+state["messages"])
            # for result in self.llm_chain.stream({"message":state["messages"]},config=config,stream_mode = "values"):
            #     result_messages = result.get("messages", [])

            #     ai_messages = [
            #         m
            #         for m in result_messages
            #         if isinstance(m, AIMessage) or isinstance(m, AIMessageChunk)
            #     ]
            #     if ai_messages:
            #         state["messages"].append(ai_messages[-1])
            #         store._redis.lpush(self.draft_id, ai_messages[-1].model_dump_json())
            message = getattr(state["message"], "content")
            summary = state.get("summary") or  "Không có tóm tắt"
            state["messages"].append(HumanMessage(content=f"Tóm tắt của email trước đó: {summary}\n\nYêu cầu: {message}"))
            result = self.llm.invoke([{"role": "system", "content": system_prompt}] + state["messages"])
            state["messages"].append(result)
            store._redis.lpush(self.draft_id, result.model_dump_json())

        except Exception as e:
            agent_response = AIMessage(
                content="I'm sorry, I encountered an error processing your request."
            )
            state["messages"].append(agent_response)

        return state