import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./humsaathi.db")
    PORT: int = int(os.getenv("PORT", "8000"))
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")
    
    # Server-side Admin Initial Provisioning (optional via env)
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
    
    # AI configuration
    AI_API_KEY: str = (
        os.getenv("AI_API_KEY") or
        os.getenv("GEMINI_API_KEY") or
        os.getenv("GOOGLE_API_KEY") or
        os.getenv("OPENAI_API_KEY") or
        os.getenv("DASHSCOPE_API_KEY") or
        ""
    )
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")

    @property
    def cors_origins(self) -> list[str]:
        defaults = [
            "https://hum-saathi-ai.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]
        if not self.ALLOWED_ORIGINS or self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        custom = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        return list(set(defaults + custom))

    @property
    def clean_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        elif url.startswith("file:"):
            url = f"sqlite:///{url[5:]}"
        if os.getenv("VERCEL") and (url.startswith("sqlite:///.") or url == "sqlite:///./humsaathi.db"):
            url = "sqlite:////tmp/humsaathi.db"
        return url

settings = Settings()
