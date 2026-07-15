"""Cloud-neutral runtime configuration.

All provider-specific values live in environment variables so the same image can
run locally, on Supabase, AWS, Azure, OCI, Render, or another container host.
"""
from dataclasses import dataclass, field
import os


def _csv(value: str) -> list[str]:
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    auth_provider: str = os.getenv("AUTH_PROVIDER", "local")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./portfolio.db")
    cors_origins: list[str] = field(default_factory=lambda: _csv(os.getenv("CORS_ORIGINS", "http://localhost:3001")))
    admin_phone: str = os.getenv("ADMIN_PHONE", "+918847472124")
    admin_initial_password: str = os.getenv("ADMIN_INITIAL_PASSWORD", "123456")
    jwt_secret: str = os.getenv("JWT_SECRET", "local-development-secret-change-me")
    otp_hash_secret: str = os.getenv("OTP_HASH_SECRET", "local-development-otp-secret-change-me")
    email_otp_provider: str = os.getenv("EMAIL_OTP_PROVIDER", "development")
    sms_otp_provider: str = os.getenv("SMS_OTP_PROVIDER", "development")
    otp_expiry_minutes: int = int(os.getenv("OTP_EXPIRY_MINUTES", "30"))
    otp_max_attempts: int = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_username: str = os.getenv("SMTP_USERNAME", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL", "")
    smtp_from_name: str = os.getenv("SMTP_FROM_NAME", "Sanjay Gandhi Portfolio")
    textlocal_api_key: str = os.getenv("TEXTLOCAL_API_KEY", "")
    textlocal_sender: str = os.getenv("TEXTLOCAL_SENDER", "")
    supabase_url: str = os.getenv("SUPABASE_URL", "").rstrip("/")
    supabase_publishable_key: str = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    def validate(self) -> None:
        if not self.is_production:
            return
        if self.database_url.startswith("sqlite"):
            raise RuntimeError("DATABASE_URL must point to managed PostgreSQL in production.")
        if "change-me" in self.jwt_secret or len(self.jwt_secret) < 32:
            raise RuntimeError("Set a strong JWT_SECRET in production.")
        if "change-me" in self.otp_hash_secret or len(self.otp_hash_secret) < 32:
            raise RuntimeError("Set a strong OTP_HASH_SECRET in production.")
        if self.auth_provider == "supabase":
            if not self.supabase_url or not self.supabase_publishable_key:
                raise RuntimeError("Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in production.")
            return
        if self.email_otp_provider != "smtp":
            raise RuntimeError("EMAIL_OTP_PROVIDER must be 'smtp' in production.")
        if self.sms_otp_provider != "textlocal":
            raise RuntimeError("SMS_OTP_PROVIDER must be 'textlocal' in production.")
        if not all((self.smtp_host, self.smtp_username, self.smtp_password, self.smtp_from_email)):
            raise RuntimeError("Configure all SMTP settings in production.")
        if not self.textlocal_api_key or not self.textlocal_sender:
            raise RuntimeError("Configure Textlocal credentials in production.")


settings = Settings()
