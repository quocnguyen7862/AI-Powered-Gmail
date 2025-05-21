from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import RedisChatMessageHistory
import os

# Redis config
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

def redis_memory(session_id:str)->ConversationBufferMemory:
    message_history = RedisChatMessageHistory(
        session_id=session_id,
        url=REDIS_URL
    )

    return ConversationBufferMemory(
        memory_key="chat_history",
        chat_memory=message_history,
        return_messages=True,
    )