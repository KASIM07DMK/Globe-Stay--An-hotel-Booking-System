from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True
    PROJECT_NAME: str = "GlobeStay API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "dev-globestay-super-secret-key-32chars-min-len"
    
    # Server
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8000
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "sqlite:///./globestay.db"

    # JWT Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # External Adapters (Sandbox defaults)
    PAYMENT_PROVIDER: str = "sandbox"
    PAYMENT_SECRET_KEY: str = "sk_test_globestay_sandbox_mock_key"
    PAYMENT_WEBHOOK_SECRET: str = "whsec_test_globestay_sandbox_secret"

    EMAIL_PROVIDER: str = "console"
    EMAIL_API_KEY: str = "mock-email-api-key"
    EMAIL_FROM: str = "no-reply@globestay.com"

    MAPS_PROVIDER: str = "mock"
    MAPS_API_KEY: str = "mock-maps-api-key"

    EXCHANGE_RATE_PROVIDER: str = "mock"
    EXCHANGE_RATE_API_KEY: str = "mock-exchange-rate-key"

    HOTEL_SUPPLIER_PROVIDER: str = "mock"
    HOTEL_SUPPLIER_API_KEY: str = "mock-supplier-key"

    # Booking hold duration in minutes
    BOOKING_HOLD_DURATION_MINUTES: int = 15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
