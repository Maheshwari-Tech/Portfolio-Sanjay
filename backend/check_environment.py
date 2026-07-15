"""Validate configuration without printing credentials or contacting providers."""

from __future__ import annotations

import os
from urllib.parse import urlparse

from settings import settings


PLACEHOLDERS = ("REPLACE_ME", "YOUR_", "<", ">")


def require_real_value(name: str, value: str) -> None:
    if not value or any(marker in value for marker in PLACEHOLDERS):
        raise SystemExit(f"{name} is missing or still contains a sample value.")


def main() -> None:
    require_real_value("DATABASE_URL", settings.database_url)
    require_real_value("SUPABASE_URL", settings.supabase_url)
    require_real_value("SUPABASE_PUBLISHABLE_KEY", settings.supabase_publishable_key)
    require_real_value("JWT_SECRET", settings.jwt_secret)
    require_real_value("OTP_HASH_SECRET", settings.otp_hash_secret)

    if settings.auth_provider != "supabase":
        raise SystemExit("AUTH_PROVIDER must be 'supabase' for the hosted setup.")
    if not settings.database_url.startswith("postgresql+psycopg://"):
        raise SystemExit("DATABASE_URL must use the postgresql+psycopg:// SQLAlchemy scheme.")
    if len(settings.jwt_secret) < 32 or len(settings.otp_hash_secret) < 32:
        raise SystemExit("JWT_SECRET and OTP_HASH_SECRET must each be at least 32 characters.")
    if settings.jwt_secret == settings.otp_hash_secret:
        raise SystemExit("JWT_SECRET and OTP_HASH_SECRET must be different.")
    if not settings.cors_origins:
        raise SystemExit("CORS_ORIGINS must contain at least one exact frontend origin.")
    if any("/" in origin.replace("https://", "").replace("http://", "") for origin in settings.cors_origins):
        raise SystemExit("CORS_ORIGINS entries must be origins only, with no paths.")

    parsed = urlparse(settings.database_url.replace("postgresql+psycopg://", "postgresql://", 1))
    expected_port = 6543 if os.getenv("RUNTIME_TARGET") == "lambda" else 5432
    if parsed.port != expected_port:
        raise SystemExit(f"DATABASE_URL should use port {expected_port} for this runtime.")

    settings.validate()
    print(
        "Environment ready: "
        f"env={settings.app_env}, auth=supabase, database=postgresql, "
        f"pooler_port={parsed.port}, cors_origins={len(settings.cors_origins)}."
    )


if __name__ == "__main__":
    main()
