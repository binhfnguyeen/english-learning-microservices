from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OLLAMA_API_URL: str = "http://english_ollama:11434/api/generate"
    BACKEND_API_URL: str = "http://backend-service:8080/api"

    class Config:
        env_file = ".env"


settings = Settings()