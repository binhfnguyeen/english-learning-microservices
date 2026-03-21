import asyncio
import logging
import httpx
import py_eureka_client.eureka_client as eureka_client

logger = logging.getLogger(__name__)

async def connect_eureka_forever():
    eureka_url = "http://eureka-server:8761/eureka"
    retry_delay = 10
    attempt = 0

    async with httpx.AsyncClient() as client:
        while True:
            attempt += 1
            try:
                logger.info(f"[EUREKA] Thử kết nối lần {attempt}...")
                response = await client.get("http://eureka-server:8761/")

                if response.status_code == 200:
                    await eureka_client.init_async(
                        eureka_server=eureka_url,
                        app_name="ai-service",
                        instance_host="ai-service",
                        instance_port=8083,
                        renewal_interval_in_secs=30,
                        duration_in_secs=90
                    )
                    logger.info("[EUREKA] ✅ Đăng ký thành công!")
                    return
                else:
                    logger.warning(f"[EUREKA] Server trả về code {response.status_code}, đợi thêm...")

            except (httpx.ConnectError, Exception) as e:
                logger.warning(f"[EUREKA] ❌ Chưa thể kết nối: {e}")

            await asyncio.sleep(retry_delay)