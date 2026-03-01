import redis
import json
import os

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", 12345)

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    db=0,
    decode_responses=True
)

class ChatStorage:
    @staticmethod
    def push_message(user_id: str, role: str, content: str):
        key = f"chat_history:{user_id}"
        message = json.dumps({"role": role, "content": content})
        # Đẩy tin nhắn mới vào cuối danh sách
        redis_client.rpush(key, message)
        # Tự động xóa sau 24h
        redis_client.expire(key, 86400)
        # Giới hạn chỉ giữ 20 tin nhắn gần nhất
        redis_client.ltrim(key, -20, -1)

    @staticmethod
    def get_history(user_id: str):
        key = f"chat_history:{user_id}"
        messages = redis_client.lrange(key, 0, -1)
        return [json.loads(m) for m in messages]

    @staticmethod
    def delete_history(user_id: str):
        redis_client.delete(f"chat_history:{user_id}")