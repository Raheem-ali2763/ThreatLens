from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    jwt_secret_key: str
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    URLHAUS_AUTH_KEY: str = ""
    DATABASE_URL: str
    ABUSEIPDB_API_KEY: str | None = None
    THREATFOX_AUTH_KEY: str | None = None
    VIRUSTOTAL_API_KEY: str | None = None 
    class Config:
        env_file = ".env"


settings = Settings()
