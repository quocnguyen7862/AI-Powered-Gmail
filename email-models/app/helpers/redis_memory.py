from langchain.memory import ConversationBufferMemory
from langchain.memory.chat_message_histories import RedisChatMessageHistory
import os
from redis import Redis
import pickle
from datetime import datetime
from enum import Enum
from typing import List,Optional,Union, Dict
from pydantic import BaseModel, Field
import ulid
from redisvl.index import SearchIndex
from redisvl.schema.schema import IndexSchema
from redisvl.query import VectorRangeQuery
from redisvl.query.filter import Tag
from redisvl.utils.vectorize.text.openai import OpenAITextVectorizer
from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig

# Redis config
SYSTEM_USER_ID = "system"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = Redis.from_url(REDIS_URL)
os.environ["OPENAI_API_KEY"]="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"

class MemoryType(str, Enum):
    """
    The type of a long-term memory.

    EPISODIC: User specific experiences and preferences

    SEMANTIC: General knowledge on top of the user's preferences and LLM's
    training data.
    """

    EPISODIC = "episodic"
    SEMANTIC = "semantic"

class Memory(BaseModel):
    """Represents a single long-term memory."""

    content: str
    memory_type: MemoryType
    metadata: str

class Memories(BaseModel):
    """
    A list of memories extracted from a conversation by an LLM.

    NOTE: OpenAI's structured output requires us to wrap the list in an object.
    """
    memories: List[Memory]

class StoredMemory(Memory):
    """A stored long-term memory"""

    id: str  # The redis key
    memory_id: ulid.ULID = Field(default_factory=lambda: ulid.ULID())
    created_at: datetime = Field(default_factory=datetime.now)
    user_id: Optional[str] = None
    thread_id: Optional[str] = None
    memory_type: Optional[MemoryType] = None

class MemoryStrategy(str, Enum):
    """
    Supported strategies for managing long-term memory.
    
    This notebook supports two strategies for working with long-term memory:

    TOOLS: The LLM decides when to store and retrieve long-term memories, using
    tools (AKA, function-calling) to do so.

    MANUAL: The agent manually retrieves long-term memories relevant to the
    current conversation before sending every message and analyzes every
    response to extract memories to store.

    NOTE: In both cases, the agent runs a background thread to consolidate
    memories, and a workflow step to summarize conversations after the history
    grows past a threshold.
    """

    TOOLS = "tools"
    MANUAL = "manual"

# Define schema for long-term memory index
memory_schema = IndexSchema.from_dict({
        "index": {
            "name": "agent_memories",
            "prefix": "memory:",
            "key_separator": ":",
            "storage_type": "json",
        },
        "fields": [
            {"name": "content", "type": "text"},
            {"name": "memory_type", "type": "tag"},
            {"name": "metadata", "type": "text"},
            {"name": "created_at", "type": "text"},
            {"name": "user_id", "type": "tag"},
            {"name": "memory_id", "type": "tag"},
            {
                "name": "embedding",
                "type": "vector",
                "attrs": {
                    "algorithm": "flat",
                    "dims": 1536,  # OpenAI embedding dimension
                    "distance_metric": "cosine",
                    "datatype": "float32",
                },
            },
        ],
    }
)

# Create search index
try:
    long_term_memory_index = SearchIndex(
        schema=memory_schema, redis_client=redis_client, overwrite=True
    )
    long_term_memory_index.create()
    print("Long-term memory index ready")
except Exception as e:
    print(f"Error creating index: {e}")

openai_embed = OpenAITextVectorizer(model="text-embedding-ada-002")

memory_strategy = MemoryStrategy.TOOLS

def similar_memory_exists(
    content: str,
    memory_type: MemoryType,
    user_id: str = SYSTEM_USER_ID,
    thread_id: Optional[str] = None,
    distance_threshold: float = 0.1,
) -> bool:
    """Check if a similar long-term memory already exists in Redis."""
    query_embedding = openai_embed.embed(content)
    filters = (Tag("user_id") == user_id) & (Tag("memory_type") == memory_type)
    if thread_id:
        filters = filters & (Tag("thread_id") == thread_id)

    # Search for similar memories
    vector_query = VectorRangeQuery(
        vector=query_embedding,
        num_results=1,
        vector_field_name="embedding",
        filter_expression=filters,
        distance_threshold=distance_threshold,
        return_fields=["id"],
    )
    results = long_term_memory_index.query(vector_query)
    # logger.debug(f"Similar memory search results: {results}")

    if results:
        # logger.debug(
        #     f"{len(results)} similar {'memory' if results.count == 1 else 'memories'} found. First: "
        #     f"{results[0]['id']}. Skipping storage."
        # )
        return True

    return False

def store_memory(
    content: str,
    memory_type: MemoryType,
    user_id: str = SYSTEM_USER_ID,
    thread_id: Optional[str] = None,
    metadata: Optional[str] = None,
):
    """Store a long-term memory in Redis, avoiding duplicates."""
    if metadata is None:
        metadata = "{}"

    # logger.info(f"Preparing to store memory: {content}")

    if similar_memory_exists(content, memory_type, user_id, thread_id):
        # logger.info("Similar memory found, skipping storage")
        return

    embedding = openai_embed.embed(content)

    memory_data = {
        "user_id": user_id or SYSTEM_USER_ID,
        "content": content,
        "memory_type": memory_type.value,
        "metadata": metadata,
        "created_at": datetime.now().isoformat(),
        "embedding": embedding,
        "memory_id": str(ulid.ULID()),
        "thread_id": thread_id,
    }

    try:
        long_term_memory_index.load([memory_data])
    except Exception as e:
        # logger.error(f"Error storing memory: {e}")
        return

    # logger.info(f"Stored {memory_type} memory: {content}")

def retrieve_memories(
    query: str,
    memory_type: Union[Optional[MemoryType], List[MemoryType]] = None,
    user_id: str = SYSTEM_USER_ID,
    thread_id: Optional[str] = None,
    distance_threshold: float = 0.1,
    limit: int = 5,
) -> List[StoredMemory]:
    """Retrieve relevant memories from Redis"""
    # Create vector query
    # logger.debug(f"Retrieving memories for query: {query}")
    vector_query = VectorRangeQuery(
        vector=openai_embed.embed(query),
        return_fields=[
            "content",
            "memory_type",
            "metadata",
            "created_at",
            "memory_id",
            "thread_id",
            "user_id",
        ],
        num_results=limit,
        vector_field_name="embedding",
        dialect=2,
        distance_threshold=distance_threshold,
    )

    base_filters = [f"@user_id:{{{user_id or SYSTEM_USER_ID}}}"]

    if memory_type:
        if isinstance(memory_type, list):
            base_filters.append(f"@memory_type:{{{'|'.join(memory_type)}}}")
        else:
            base_filters.append(f"@memory_type:{{{memory_type.value}}}")

    if thread_id:
        base_filters.append(f"@thread_id:{{{thread_id}}}")

    vector_query.set_filter(" ".join(base_filters))

    # Execute search
    results = long_term_memory_index.query(vector_query)

    # Parse results
    memories = []
    for doc in results:
        try:
            memory = StoredMemory(
                id=doc["id"],
                memory_id=doc["memory_id"],
                user_id=doc["user_id"],
                thread_id=doc.get("thread_id", None),
                memory_type=MemoryType(doc["memory_type"]),
                content=doc["content"],
                created_at=doc["created_at"],
                metadata=doc["metadata"],
            )
            memories.append(memory)
        except Exception as e:
            # logger.error(f"Error parsing memory: {e}")
            continue
    return memories

@tool
def store_memory_tool(
    content:str,
    memory_type:MemoryType,
    metadata:Optional[Dict[str,str]] = None,
    config: Optional[RunnableConfig]=None,
)->str:
    """
    Store a long-term memory in the system.

    Use this tool to save important information about user preferences,
    experiences, or general knowledge that might be useful in future
    interactions.
    """
    config = config or RunnableConfig()
    user_id = config.get("user_id", SYSTEM_USER_ID)
    thread_id = config.get("thread_id")

    try:
        # Store in long-term memory
        store_memory(
            content=content,
            memory_type=memory_type,
            user_id=user_id,
            thread_id=thread_id,
            metadata=str(metadata) if metadata else None,
        )

        return f"Successfully stored {memory_type} memory: {content}"
    except Exception as e:
        return f"Error storing memory: {str(e)}"
    
@tool
def retrieve_memories_tool(
    query: str,
    memory_type: List[MemoryType],
    limit: int = 5,
    config: Optional[RunnableConfig] = None,
) -> str:
    """
    Retrieve long-term memories relevant to the query.

    Use this tool to access previously stored information about user
    preferences, experiences, or general knowledge.
    """
    config = config or RunnableConfig()
    user_id = config.get("user_id", SYSTEM_USER_ID)

    try:
        # Get long-term memories
        stored_memories = retrieve_memories(
            query=query,
            memory_type=memory_type,
            user_id=user_id,
            limit=limit,
            distance_threshold=0.3,
        )

        # Format the response
        response = []

        if stored_memories:
            response.append("Long-term memories:")
            for memory in stored_memories:
                response.append(f"- [{memory.memory_type}] {memory.content}")

        return "\n".join(response) if response else "No relevant memories found."

    except Exception as e:
        return f"Error retrieving memories: {str(e)}"
    
# def redis_memory(session_id:str)->ConversationBufferMemory:
#     message_history = RedisChatMessageHistory(
#         session_id=session_id,
#         url=REDIS_URL
#     )

#     return ConversationBufferMemory(
#         memory_key="chat_history",
#         chat_memory=message_history,
#         return_messages=True,
#     )

# def save_chat_history(user_id,messages):
#     key = f"chat_history:{user_id}"
#     redis_client.set(key, pickle.dumps(messages))

# def load_chat_history(user_id):
#     key = f"chat_history:{user_id}"
#     data = redis_client.get(key)
#     if data:
#         return pickle.loads(data)
#     return []