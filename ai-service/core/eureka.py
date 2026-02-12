import asyncio
import py_eureka_client.eureka_client as eureka_client

async def init_eureka(app):
    await asyncio.sleep(10)
    await eureka_client.init_async(
        eureka_server="http://eureka-server:8761/eureka",
        app_name="ai-service",
        instance_host="ai-service",
        instance_port=8083,
    )