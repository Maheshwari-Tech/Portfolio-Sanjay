"""Fail-fast database connection and schema check without exposing credentials."""
from sqlalchemy import create_engine, inspect, text

from settings import settings


REQUIRED_TABLES = {"store_metadata", "portfolio_users", "user_access", "submissions", "content_likes", "content_comments", "blogs", "projects", "otp_challenges"}


def main() -> None:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    with engine.connect() as connection:
        database, server_version = connection.execute(
            text("select current_database(), current_setting('server_version')")
        ).one()
    present = set(inspect(engine).get_table_names(schema="public"))
    missing = REQUIRED_TABLES - present
    if missing:
        raise SystemExit(f"Database is reachable, but migrations are missing: {', '.join(sorted(missing))}")
    print(f"Database ready: {database} (PostgreSQL {server_version}); required schema is present.")


if __name__ == "__main__":
    main()
