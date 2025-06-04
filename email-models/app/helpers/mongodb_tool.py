# import os
# from langchain.agents.tools import tool
# from typing import TypedDict, Optional
# from pymongo import MongoClient

# # Mongo config
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:admin@localhost:27017")
# MONGO_DB = os.getenv("MONGO_DB", "admin")
# MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "email_summaries")

# @tool
# def get_email_summary(message_id:str)-> Optional[str]:
#     """Lấy tóm tắt email từ MongoDB theo messageId"""
#     mongodb_client = MongoClient(MONGO_URI)
#     collection = mongodb_client[MONGO_DB][MONGO_COLLECTION]
#     doc = collection.find_one({"messageId": message_id})
#     return doc['summary'] if doc else None