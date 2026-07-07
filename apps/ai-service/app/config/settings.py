from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized, validated application configuration. Values are read
    from environment variables (and a local .env file if present) and
    validated at startup — misconfiguration fails fast with a clear
    error rather than surfacing as a confusing runtime failure later.
    """

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", protected_namespaces=())

    # ---------- General ----------
    app_name: str = Field(default="CivicVision AI Service")
    app_version: str = Field(default="1.0.0")
    environment: Literal["development", "test", "production"] = Field(default="development")
    log_level: str = Field(default="INFO")

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, value: str | None) -> str | None:
        if isinstance(value, str):
            return value.strip().upper()
        return value

    # ---------- Server ----------
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)

    # ---------- CORS ----------
    cors_origin: str = Field(default="http://localhost:5173")

    # ---------- Model / inference ----------
    # Path is intentionally optional: the detector service loads the
    # model lazily on first inference request (see services/detector_service.py),
    # so the API can boot and serve /health even before weights are staged.
    model_weights_path: str | None = Field(default=None)
    yolo_confidence_threshold: float = Field(default=0.25, ge=0.0, le=1.0)

    # ---------- MLflow ----------
    mlflow_tracking_uri: str = Field(default="http://localhost:5001")


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor — Settings() is only constructed once per process."""
    return Settings()


settings = get_settings()
