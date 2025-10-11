import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5433/churn_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI API Keys - Google Gemini (Main AI Engine)
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    # Tavily Web Search (Optional - for real-time data)
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

settings = Settings()
