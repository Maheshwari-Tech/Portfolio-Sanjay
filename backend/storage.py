"""Small durable store that works with SQLite locally and PostgreSQL in cloud."""
from datetime import datetime, timezone
import json
from sqlalchemy import Column, DateTime, Integer, MetaData, String, Table, Text, create_engine, select, text


metadata = MetaData()
state_table = Table(
    "portfolio_state", metadata,
    Column("key", String(100), primary_key=True),
    Column("value", Text, nullable=False),
    Column("updated_at", DateTime(timezone=True), nullable=False),
)
challenge_table = Table(
    "otp_challenges", metadata,
    Column("identifier", String(320), primary_key=True),
    Column("code_hash", String(128), nullable=False),
    Column("expires_at", DateTime(timezone=True), nullable=False),
    Column("attempts", Integer, nullable=False, default=0),
)


class Store:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url, pool_pre_ping=True)
        metadata.create_all(self.engine)

    def ping(self) -> None:
        with self.engine.connect() as conn:
            conn.execute(text("select 1"))

    def get_json(self, key: str, default):
        with self.engine.connect() as conn:
            row = conn.execute(select(state_table.c.value).where(state_table.c.key == key)).scalar_one_or_none()
        return default if row is None else json.loads(row)

    def put_json(self, key: str, value) -> None:
        now = datetime.now(timezone.utc)
        payload = json.dumps(value)
        with self.engine.begin() as conn:
            existing = conn.execute(select(state_table.c.key).where(state_table.c.key == key)).scalar_one_or_none()
            if existing:
                conn.execute(state_table.update().where(state_table.c.key == key).values(value=payload, updated_at=now))
            else:
                conn.execute(state_table.insert().values(key=key, value=payload, updated_at=now))

    def put_challenge(self, identifier: str, code_hash: str, expires_at: datetime) -> None:
        with self.engine.begin() as conn:
            existing = conn.execute(select(challenge_table.c.identifier).where(challenge_table.c.identifier == identifier)).scalar_one_or_none()
            values = {"code_hash": code_hash, "expires_at": expires_at, "attempts": 0}
            if existing:
                conn.execute(challenge_table.update().where(challenge_table.c.identifier == identifier).values(**values))
            else:
                conn.execute(challenge_table.insert().values(identifier=identifier, **values))

    def get_challenge(self, identifier: str):
        with self.engine.connect() as conn:
            row = conn.execute(select(challenge_table).where(challenge_table.c.identifier == identifier)).mappings().one_or_none()
        return dict(row) if row else None

    def fail_challenge(self, identifier: str) -> None:
        with self.engine.begin() as conn:
            conn.execute(challenge_table.update().where(challenge_table.c.identifier == identifier).values(attempts=challenge_table.c.attempts + 1))

    def clear_challenge(self, identifier: str) -> None:
        with self.engine.begin() as conn:
            conn.execute(challenge_table.delete().where(challenge_table.c.identifier == identifier))
