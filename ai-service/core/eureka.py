import asyncio
import py_eureka_client.eureka_client as eureka_client

async def init_eureka(app):
    retry_delay = 10
    max_retries = 20
    attempt = 0

    while attempt < max_retries:
        try:
            print(f"Attempt {attempt + 1} to connect Eureka...")
            await eureka_client.init_async(
                eureka_server="http://eureka-server:8761/eureka",
                app_name="ai-service",
                instance_host="ai-service",
                instance_port=8083,
            )
            print("Connected to Eureka!")
            return

        except Exception as e:
            print(f"Failed: {e}")
            attempt += 1
            await asyncio.sleep(retry_delay)

    raise RuntimeError("Could not connect to Eureka after retries")