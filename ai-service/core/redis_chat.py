import redis
import json
import os

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", 12345)

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    db=0,
    decode_responses=True
)


class RedisStorage:

    DEFAULT_EXPIRE = 86400  # 24h
    DEFAULT_LIMIT = 20

    @staticmethod
    def _build_key(namespace: str, user_id: str):
        return f"{namespace}:{user_id}"

    @staticmethod
    def push_message(
            namespace: str,
            user_id: str,
            role: str,
            content: str,
            expire: int = None,
            limit: int = None
    ):
        key = RedisStorage._build_key(namespace, user_id)

        message = json.dumps({
            "role": role,
            "content": content
        })

        redis_client.rpush(key, message)

        # expire
        redis_client.expire(key, expire or RedisStorage.DEFAULT_EXPIRE)

        # limit
        redis_client.ltrim(key, -(limit or RedisStorage.DEFAULT_LIMIT), -1)

    @staticmethod
    def get_history(namespace: str, user_id: str):
        key = RedisStorage._build_key(namespace, user_id)
        messages = redis_client.lrange(key, 0, -1)
        return [json.loads(m) for m in messages]

    @staticmethod
    def delete_history(namespace: str, user_id: str):
        key = RedisStorage._build_key(namespace, user_id)
        redis_client.delete(key)