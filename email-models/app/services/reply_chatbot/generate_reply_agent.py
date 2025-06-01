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
    def __init__(self, llm):
        self.llm = llm
        # self.llm_chain = create_react_agent(model=llm,prompt=SystemMessage(content=system_prompt),tools=[])
    
    def __call__(self, state: ReplyState,config:RunnableConfig,*,store:BaseStore) -> dict:
        system_prompt = f"""
        You are a professional AI assistant for a user named {state['user_name']}. Your primary task is to help the user draft and reply to emails in a clear, concise, and polite manner.

        You may receive different types of context to support email composition:

        1. If a summary of the email thread is available, use it to generate a relevant reply.
        2. If summaries of uploaded attachments are provided (e.g., PDF reports, documents), treat them as part of the context for composing the message.
        3. If only the user’s request is available (e.g., “Please write a message summarizing the attached report”), use that to generate an appropriate draft.

        Writing guidelines:
        - Use a clear, coherent, and polite tone.
        - Do not include subject lines or signatures unless explicitly requested.
        - Keep your response between 3–6 well-structured sentences.
        """

        # human_messages = [m for m in state["messages"] if isinstance(m, HumanMessage)]
        # if not human_messages:
        #     return state
            

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
            summary = state.get("summary") or  "Không có tóm tắt email trước đó."
            summary_attachs = state.get("attachment_summaries") or "Không có tóm tắt tệp đính kèm."
            state["messages"].append(HumanMessage(content=f"Summary of email thread: \n{summary}\n\n"
                                                  f"Summary of attached files: \n{summary_attachs}\n\n"
                                                  f"User request: \n{message}"))
            result = self.llm.invoke([{"role": "system", "content": system_prompt}] + state["messages"])
            state["messages"].append(result)
            
            user_id = config["configurable"].get("user_id", str(uuid.uuid4()))
            draft_id = config["configurable"].get("thread_id", str(uuid.uuid4()))
            store._redis.lpush(draft_id, state['message'].model_dump_json())
            store._redis.lpush(draft_id, result.model_dump_json())

        except AttributeError as e:
            raise ValueError("Invalid tool configuration or missing tools") from e
        except Exception as e:
            agent_response = AIMessage(
                content="I'm sorry, I encountered an error processing your request."
            )
            state["messages"].append(agent_response)

        return state