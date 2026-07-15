"""Normalized SQLAlchemy store for SQLite locally and PostgreSQL in production."""
from datetime import datetime, timezone
import os
from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, MetaData, String, Table, Text, UniqueConstraint, create_engine, delete, select, text
from sqlalchemy.pool import NullPool


metadata = MetaData()
store_meta_table = Table("store_metadata", metadata, Column("key", String(100), primary_key=True), Column("value", String(100), nullable=False))
users_table = Table("portfolio_users", metadata,
    Column("id", Integer, primary_key=True), Column("supabase_id", String(64), unique=True),
    Column("name", String(120), nullable=False), Column("phone", String(32), unique=True),
    Column("email", String(320), unique=True), Column("role", String(32), nullable=False, default="member"),
    Column("password_hash", Text), Column("created_at", DateTime(timezone=True), nullable=False))
access_table = Table("user_access", metadata,
    Column("user_id", Integer, ForeignKey("portfolio_users.id", ondelete="CASCADE"), primary_key=True),
    Column("area", String(32), primary_key=True))
submissions_table = Table("submissions", metadata,
    Column("id", Integer, primary_key=True), Column("user_id", Integer, ForeignKey("portfolio_users.id", ondelete="SET NULL")),
    Column("type", String(40), nullable=False), Column("title", String(240), nullable=False),
    Column("name", String(120), nullable=False), Column("email", String(320)), Column("message", Text),
    Column("category", String(120)), Column("rating", String(20)), Column("project_id", String(80)),
    Column("status", String(32), nullable=False, default="pending"), Column("created_at", DateTime(timezone=True), nullable=False))
likes_table = Table("content_likes", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True), Column("content_id", String(120), nullable=False),
    Column("identity", String(320), nullable=False), Column("created_at", DateTime(timezone=True), nullable=False),
    UniqueConstraint("content_id", "identity", name="uq_content_like_identity"))
comments_table = Table("content_comments", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True), Column("source_comment_id", Integer, nullable=False),
    Column("content_id", String(120), nullable=False), Column("user_id", Integer, ForeignKey("portfolio_users.id", ondelete="SET NULL")),
    Column("author", String(120), nullable=False), Column("message", Text, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False),
    UniqueConstraint("content_id", "source_comment_id", name="uq_content_comment_source"))
blogs_table = Table("blogs", metadata, Column("id", Integer, primary_key=True), Column("sort_order", Integer, nullable=False), Column("payload", JSON, nullable=False))
projects_table = Table("projects", metadata, Column("id", Integer, primary_key=True), Column("sort_order", Integer, nullable=False), Column("payload", JSON, nullable=False))
challenge_table = Table("otp_challenges", metadata,
    Column("identifier", String(320), primary_key=True), Column("code_hash", String(128), nullable=False),
    Column("expires_at", DateTime(timezone=True), nullable=False), Column("attempts", Integer, nullable=False, default=0))


def _dt(value=None):
    if isinstance(value, datetime): return value
    if value: return datetime.fromisoformat(value.replace("Z", "+00:00"))
    return datetime.now(timezone.utc)


def _serialize(row):
    value = dict(row)
    for key, item in list(value.items()):
        if isinstance(item, datetime): value[key] = item.isoformat()
    return value


class Store:
    def __init__(self, database_url: str):
        engine_options = {"pool_pre_ping": True}
        if os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("RUNTIME_TARGET") == "lambda":
            engine_options["poolclass"] = NullPool
        if "pooler.supabase.com:6543" in database_url:
            engine_options["connect_args"] = {"prepare_threshold": None}
        self.engine = create_engine(database_url, **engine_options)
        metadata.create_all(self.engine)

    def ping(self):
        with self.engine.connect() as conn: conn.execute(text("select 1"))

    def get_json(self, key: str, default):
        if key == "application": return self._application(default)
        table = blogs_table if key == "content:blogs.json" else projects_table if key == "content:projects.json" else None
        if table is None: return default
        with self.engine.connect() as conn:
            rows = conn.execute(select(table.c.payload).order_by(table.c.sort_order)).scalars().all()
        return rows if rows else default

    def put_json(self, key: str, value):
        if key == "application": self._replace_application(value); return
        table = blogs_table if key == "content:blogs.json" else projects_table if key == "content:projects.json" else None
        if table is None: raise KeyError(f"Unsupported state key: {key}")
        with self.engine.begin() as conn:
            conn.execute(delete(table))
            if value: conn.execute(table.insert(), [{"id": int(item["id"]), "sort_order": index, "payload": item} for index, item in enumerate(value)])

    def _application(self, default):
        with self.engine.connect() as conn:
            initialized = conn.execute(select(store_meta_table.c.value).where(store_meta_table.c.key == "application_initialized")).scalar_one_or_none()
            user_rows = conn.execute(select(users_table).order_by(users_table.c.id)).mappings().all()
            if not initialized: return default
            accesses = conn.execute(select(access_table)).mappings().all()
            submissions = conn.execute(select(submissions_table).order_by(submissions_table.c.id)).mappings().all()
            likes = conn.execute(select(likes_table).order_by(likes_table.c.id)).mappings().all()
            comments = conn.execute(select(comments_table).order_by(comments_table.c.id)).mappings().all()
        access_by_user = {}
        for row in accesses: access_by_user.setdefault(row["user_id"], []).append(row["area"])
        users = []
        for row in user_rows:
            user = _serialize(row); user["access"] = access_by_user.get(row["id"], []); users.append(user)
        interactions = {}
        for row in likes: interactions.setdefault(row["content_id"], {"likes": [], "comments": []})["likes"].append(row["identity"])
        for row in comments:
            record = interactions.setdefault(row["content_id"], {"likes": [], "comments": []})
            record["comments"].append({"id": row["source_comment_id"], "author": row["author"], "message": row["message"], "created_at": row["created_at"].isoformat()})
        return {"users": users, "submissions": [_serialize(row) for row in submissions], "interactions": interactions}

    def _replace_application(self, value):
        with self.engine.begin() as conn:
            for table in (comments_table, likes_table, submissions_table, access_table, users_table): conn.execute(delete(table))
            users = value.get("users", [])
            if users:
                conn.execute(users_table.insert(), [{"id": int(u["id"]), "supabase_id": u.get("supabase_id"), "name": u["name"], "phone": u.get("phone"), "email": u.get("email"), "role": u.get("role", "member"), "password_hash": u.get("password_hash"), "created_at": _dt(u.get("created_at"))} for u in users])
                grants = [{"user_id": int(u["id"]), "area": area} for u in users for area in u.get("access", [])]
                if grants: conn.execute(access_table.insert(), grants)
            submissions = value.get("submissions", [])
            if submissions: conn.execute(submissions_table.insert(), [{"id": int(s["id"]), "user_id": s.get("user_id"), "type": s["type"], "title": s["title"], "name": s["name"], "email": s.get("email"), "message": s.get("message"), "category": s.get("category"), "rating": s.get("rating"), "project_id": s.get("project_id"), "status": s.get("status", "pending"), "created_at": _dt(s.get("created_at"))} for s in submissions])
            like_rows, comment_rows = [], []
            for content_id, record in value.get("interactions", {}).items():
                like_rows.extend({"content_id": content_id, "identity": identity, "created_at": datetime.now(timezone.utc)} for identity in record.get("likes", []))
                comment_rows.extend({"source_comment_id": int(c.get("id", index)), "content_id": content_id, "user_id": c.get("user_id"), "author": c["author"], "message": c["message"], "created_at": _dt(c.get("created_at"))} for index, c in enumerate(record.get("comments", []), 1))
            if like_rows: conn.execute(likes_table.insert(), like_rows)
            if comment_rows: conn.execute(comments_table.insert(), comment_rows)
            initialized = conn.execute(select(store_meta_table.c.key).where(store_meta_table.c.key == "application_initialized")).scalar_one_or_none()
            if initialized:
                conn.execute(store_meta_table.update().where(store_meta_table.c.key == "application_initialized").values(value="true"))
            else:
                conn.execute(store_meta_table.insert().values(key="application_initialized", value="true"))

    def put_challenge(self, identifier, code_hash, expires_at):
        with self.engine.begin() as conn:
            existing = conn.execute(select(challenge_table.c.identifier).where(challenge_table.c.identifier == identifier)).scalar_one_or_none()
            values = {"code_hash": code_hash, "expires_at": expires_at, "attempts": 0}
            conn.execute(challenge_table.update().where(challenge_table.c.identifier == identifier).values(**values) if existing else challenge_table.insert().values(identifier=identifier, **values))

    def get_challenge(self, identifier):
        with self.engine.connect() as conn: row = conn.execute(select(challenge_table).where(challenge_table.c.identifier == identifier)).mappings().one_or_none()
        return dict(row) if row else None

    def fail_challenge(self, identifier):
        with self.engine.begin() as conn: conn.execute(challenge_table.update().where(challenge_table.c.identifier == identifier).values(attempts=challenge_table.c.attempts + 1))

    def clear_challenge(self, identifier):
        with self.engine.begin() as conn: conn.execute(challenge_table.delete().where(challenge_table.c.identifier == identifier))
