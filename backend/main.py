"""Cloud-neutral FastAPI API. SQLite is local-only; PostgreSQL is production."""
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac, sha256
from hmac import compare_digest
from pathlib import Path
from secrets import randbelow, token_bytes
from typing import Literal
from email.message import EmailMessage
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import json
import logging
import re
import smtplib
from threading import RLock

import jwt
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field, model_validator

from settings import settings
from storage import Store


BASE_DIR = Path(__file__).parent
LEGACY_DB_PATH = BASE_DIR / "database.json"
CONTENT_DIR = BASE_DIR / "content"
BLOGS_PATH = CONTENT_DIR / "blogs.json"
PROJECTS_PATH = CONTENT_DIR / "projects.json"
TARGET_COMPANIES_PATH = CONTENT_DIR / "target_companies.json"
ARTICLES_DIR = CONTENT_DIR / "articles"
LOCAL_OTP_OUTBOX = BASE_DIR / "local_otp_outbox.json"
logger = logging.getLogger("portfolio.auth")
store = Store(settings.database_url)
bearer = HTTPBearer(auto_error=False)
identity_sync_lock = RLock()


def now() -> datetime:
    return datetime.now(timezone.utc)


def default_db():
    return {"users": [], "submissions": [], "interactions": {}}


def read_db():
    value = store.get_json("application", None)
    if value is not None:
        return value
    # One-time local migration keeps the current prototype data when upgrading.
    legacy = json.loads(LEGACY_DB_PATH.read_text()) if LEGACY_DB_PATH.exists() else default_db()
    store.put_json("application", legacy)
    return legacy


def write_db(db):
    store.put_json("application", db)


def hash_password(password: str) -> str:
    salt = token_bytes(16)
    digest = pbkdf2_hmac("sha256", password.encode(), salt, 210_000)
    return f"{salt.hex()}:{digest.hex()}"


def password_matches(password: str, encoded: str | None) -> bool:
    if not encoded or ":" not in encoded:
        return False
    salt_hex, expected = encoded.split(":", 1)
    actual = pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 210_000).hex()
    return compare_digest(actual, expected)


def ensure_development_admin() -> None:
    if settings.is_production:
        return
    db = read_db()
    user = next((item for item in db["users"] if item.get("phone") == settings.admin_phone), None)
    if not user:
        user = {"id": max([item.get("id", 0) for item in db["users"]] or [0]) + 1, "name": "Sanjay", "phone": settings.admin_phone, "role": "admin", "access": ["admin", "candidate", "recruiter"], "created_at": now().isoformat()}
        db["users"].append(user)
    user["role"] = "admin"
    user["access"] = ["admin", "candidate", "recruiter"]
    if not user.get("password_hash"):
        user["password_hash"] = hash_password(settings.admin_initial_password)
    write_db(db)


def read_content(path: Path):
    key = f"content:{path.name}"
    value = store.get_json(key, None)
    if value is not None:
        return value
    initial = json.loads(path.read_text()) if path.exists() else []
    store.put_json(key, initial)
    return initial


def write_content(path: Path, value):
    # Content lives in the configured database; the checked-in files seed a new
    # environment once and remain a frontend cache/source snapshot.
    store.put_json(f"content:{path.name}", value)


def normalise_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    return f"+{digits}" if phone.strip().startswith("+") else digits


def otp_hash(identifier: str, code: str) -> str:
    return sha256(f"{settings.otp_hash_secret}:{identifier}:{code}".encode()).hexdigest()


def utc(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def issue_token(user: dict) -> str:
    return jwt.encode(
        {"sub": str(user["id"]), "role": user["role"], "iat": now(), "exp": now() + timedelta(days=7)},
        settings.jwt_secret,
        algorithm="HS256",
    )


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if not credentials:
        raise HTTPException(401, "Please log in to continue.")
    if settings.auth_provider == "local":
        try:
            claims = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=["HS256"])
            user = next((u for u in read_db()["users"] if str(u["id"]) == claims.get("sub")), None)
            if user:
                return user
        except jwt.PyJWTError:
            pass

    if settings.auth_provider != "supabase" or not settings.supabase_url:
        raise HTTPException(401, "Your session is invalid or has expired.")
    request = Request(
        f"{settings.supabase_url}/auth/v1/user",
        headers={"Authorization": f"Bearer {credentials.credentials}", "apikey": settings.supabase_publishable_key},
    )
    try:
        with urlopen(request, timeout=5) as response:
            identity = json.loads(response.read())
    except (HTTPError, URLError, ValueError) as exc:
        raise HTTPException(401, "Your Supabase session is invalid or has expired.") from exc

    raw_phone = identity.get("phone")
    if not raw_phone:
        raise HTTPException(401, "A verified mobile number is required.")
    phone = normalise_phone(raw_phone)
    safe_name = (identity.get("user_metadata") or {}).get("name") or "Member"
    is_admin = phone == normalise_phone(settings.admin_phone)
    # React development checks and multiple protected widgets can validate the
    # same fresh identity concurrently. Keep the initial profile synchronization
    # atomic so the normalized store is not rewritten by overlapping requests.
    with identity_sync_lock:
        db = read_db()
        phone_user = next((u for u in db["users"] if normalise_phone(u.get("phone", "")) == phone), None)
        identity_user = next((u for u in db["users"] if u.get("supabase_id") == identity.get("id")), None)
        changed = False
        if phone_user and identity_user and phone_user["id"] != identity_user["id"]:
            # Reconcile a legacy duplicate created before phone normalization.
            # Keep the canonical country-code record and preserve linked requests.
            for submission in db.get("submissions", []):
                if submission.get("user_id") == identity_user["id"]:
                    submission["user_id"] = phone_user["id"]
            phone_user["access"] = sorted(set(phone_user.get("access", [])) | set(identity_user.get("access", [])))
            db["users"].remove(identity_user)
            user = phone_user
            changed = True
        else:
            user = phone_user or identity_user
        if not user:
            user = {
                "id": max([u.get("id", 0) for u in db["users"]] or [0]) + 1,
                "supabase_id": identity.get("id"),
                "name": safe_name,
                "phone": phone,
                "role": "admin" if is_admin else "member",
                "access": ["admin", "candidate", "recruiter"] if is_admin else [],
                "created_at": now().isoformat(),
            }
            db["users"].append(user)
            changed = True
        else:
            desired = {
                "supabase_id": identity.get("id"),
                "name": safe_name,
                # Authorization stays server-controlled; user metadata is never trusted for roles.
                "role": "admin" if is_admin else "member",
                "access": ["admin", "candidate", "recruiter"] if is_admin else user.get("access", []),
            }
            for key, value in desired.items():
                if user.get(key) != value:
                    user[key] = value
                    changed = True
        if changed:
            write_db(db)
    return user


def admin(user: dict = Depends(current_user)):
    if user.get("role") != "admin" or "admin" not in user.get("access", []):
        raise HTTPException(403, "Admin access only.")
    return user


def require_access(area: Literal["candidate", "recruiter"]):
    def dependency(user: dict = Depends(current_user)):
        if area not in user.get("access", []):
            raise HTTPException(403, f"{area.title()} access has not been granted to this account.")
        return user
    return dependency


class OTPRequest(BaseModel):
    phone: str | None = Field(default=None, pattern=r"^\+?[1-9]\d{7,14}$")
    email: str | None = Field(default=None, max_length=254)

    @model_validator(mode="after")
    def one_identifier(self):
        if bool(self.phone) == bool(self.email):
            raise ValueError("Provide exactly one phone number or email address.")
        if self.email and "@" not in self.email:
            raise ValueError("Provide a valid email address.")
        return self


class Verify(OTPRequest):
    code: str = Field(pattern=r"^\d{6}$")
    name: str | None = Field(default=None, max_length=80)


class PasswordLogin(BaseModel):
    phone: str = Field(pattern=r"^\+?[1-9]\d{7,14}$")
    password: str = Field(min_length=6, max_length=128)


class Submission(BaseModel):
    type: Literal["contact", "feedback", "recommendation", "demo", "candidate", "recruiter"]
    title: str
    name: str
    email: str | None = None
    message: str | None = None
    category: str | None = None
    rating: str | None = None
    project_id: str | None = None


class Interaction(BaseModel):
    action: Literal["like", "comment"]
    message: str | None = None


class ContentCreate(BaseModel):
    kind: Literal["blog", "project"]
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=3)
    body: str | None = None
    tags: list[str] = []
    technologies: list[str] = []
    category: str = "General"
    visibility: Literal["public", "private", "semi-private"] = "public"


class ContentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, min_length=3)
    body: str | None = None
    tags: list[str] | None = None
    technologies: list[str] | None = None
    category: str | None = None
    visibility: Literal["public", "private", "semi-private"] | None = None
    hidden: bool | None = None


class SubmissionStatusUpdate(BaseModel):
    status: Literal["accepted", "rejected", "later"]


class UserAccessUpdate(BaseModel):
    access: list[Literal["admin", "candidate", "recruiter"]]


class InterviewCompanyCreate(BaseModel):
    company: str = Field(min_length=2, max_length=100)
    target_role: str = Field(default="Senior Software Engineer / Tech Lead", max_length=160)
    priority: Literal["dream", "high", "target", "watch"] = "target"
    status: Literal["wishlist", "researching", "ready", "applied", "recruiter", "screening", "interviewing", "offer", "rejected", "paused"] = "wishlist"
    last_applied: str | None = None
    next_action: str | None = Field(default=None, max_length=500)
    next_action_date: str | None = None
    rounds_information: str | None = None
    company_values: str | None = None
    contacts: str | None = None
    job_url: str | None = Field(default=None, max_length=500)
    notes: str | None = None


class InterviewCompanyUpdate(BaseModel):
    company: str | None = Field(default=None, min_length=2, max_length=100)
    target_role: str | None = Field(default=None, max_length=160)
    priority: Literal["dream", "high", "target", "watch"] | None = None
    status: Literal["wishlist", "researching", "ready", "applied", "recruiter", "screening", "interviewing", "offer", "rejected", "paused"] | None = None
    last_applied: str | None = None
    next_action: str | None = Field(default=None, max_length=500)
    next_action_date: str | None = None
    rounds_information: str | None = None
    company_values: str | None = None
    contacts: str | None = None
    job_url: str | None = Field(default=None, max_length=500)
    notes: str | None = None


def ensure_interview_tracker() -> list[dict]:
    """Seed a new environment once while preserving every admin edit thereafter."""
    items = store.get_json("interview_tracker", None)
    if items is None:
        timestamp = now().isoformat()
        targets = json.loads(TARGET_COMPANIES_PATH.read_text()) if TARGET_COMPANIES_PATH.exists() else []
        items = [
            {
                "id": index,
                "company": target["company"],
                "target_role": target.get("target_role", ""),
                "priority": target.get("priority", "target"),
                "status": "wishlist",
                "last_applied": None,
                "next_action": "Research the role, team, and interview loop",
                "next_action_date": None,
                "rounds_information": "",
                "company_values": "",
                "contacts": "",
                "job_url": "",
                "notes": "",
                "created_at": timestamp,
                "updated_at": timestamp,
            }
            for index, target in enumerate(targets, start=1)
        ]
        store.put_json("interview_tracker", items)
    return items


def identifier_for(payload: OTPRequest) -> tuple[str, str]:
    if payload.phone:
        return "phone", normalise_phone(payload.phone)
    return "email", payload.email.strip().lower()  # type: ignore[union-attr]


def deliver_otp(channel: str, destination: str, code: str) -> dict:
    provider = settings.email_otp_provider if channel == "email" else settings.sms_otp_provider
    if provider == "development":
        expires_at = now() + timedelta(minutes=settings.otp_expiry_minutes)
        LOCAL_OTP_OUTBOX.write_text(json.dumps({
            "destination": destination,
            "channel": channel,
            "code": code,
            "expires_at": expires_at.isoformat(),
        }, indent=2))
        logger.warning("LOCAL OTP for %s: %s (expires %s)", destination, code, expires_at.isoformat())
        return {"message": "A sign-in code was generated. Check the local backend OTP outbox.", "expires_in_seconds": settings.otp_expiry_minutes * 60}
    if channel == "email" and provider == "smtp":
        message = EmailMessage()
        message["Subject"] = "Your Sanjay Gandhi Portfolio sign-in code"
        message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        message["To"] = destination
        message.set_content(f"Your sign-in code is {code}. It expires in 30 minutes. If you did not request it, you can ignore this email.")
        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
                smtp.starttls()
                smtp.login(settings.smtp_username, settings.smtp_password)
                smtp.send_message(message)
        except (OSError, smtplib.SMTPException) as exc:
            raise HTTPException(503, "Email delivery is temporarily unavailable.") from exc
        return {"message": "A sign-in code was sent by email.", "expires_in_seconds": 1800}
    if channel == "phone" and provider == "textlocal":
        form = urlencode({"apikey": settings.textlocal_api_key, "numbers": destination.lstrip("+"), "sender": settings.textlocal_sender, "message": f"{code} is your Sanjay Gandhi Portfolio sign-in code. Valid for 30 minutes."}).encode()
        try:
            request = Request("https://api.textlocal.in/send/", data=form, method="POST")
            with urlopen(request, timeout=10) as response:
                result = json.loads(response.read())
            if result.get("status") != "success":
                raise HTTPException(503, "SMS delivery is temporarily unavailable.")
        except HTTPException:
            raise
        except (OSError, ValueError) as exc:
            raise HTTPException(503, "SMS delivery is temporarily unavailable.") from exc
        return {"message": "A sign-in code was sent by SMS.", "expires_in_seconds": 1800}
    raise HTTPException(503, f"OTP provider '{provider}' is not configured.")


def create_otp(payload: OTPRequest, admin_only=False):
    channel, identifier = identifier_for(payload)
    if admin_only and (channel != "phone" or identifier != settings.admin_phone):
        raise HTTPException(403, "This identity is not permitted to access the admin portal.")
    active = store.get_challenge(identifier)
    if active and utc(active["expires_at"]) > now() and active["attempts"] < settings.otp_max_attempts:
        remaining = max(1, int((utc(active["expires_at"]) - now()).total_seconds()))
        return {"message": "A code is already active. Use that code until it expires.", "expires_in_seconds": remaining, "already_active": True}
    if active:
        store.clear_challenge(identifier)
    code = f"{randbelow(900000) + 100000}"
    response = deliver_otp(channel, identifier, code)
    store.put_challenge(identifier, otp_hash(identifier, code), now() + timedelta(minutes=settings.otp_expiry_minutes))
    return response


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings.validate()
    ensure_development_admin()
    yield


app = FastAPI(title="Sanjay Gandhi Portfolio API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.app_env, "auth": settings.auth_provider, "database": "postgresql" if "postgres" in settings.database_url else "sqlite"}


@app.get("/ready")
def ready():
    try:
        store.ping()
    except Exception as exc:
        raise HTTPException(503, "Database is unavailable") from exc
    return {"status": "ready"}


@app.get("/content/blogs")
def list_blogs():
    return [item for item in read_content(BLOGS_PATH) if not item.get("hidden", False)]


@app.get("/content/projects")
def list_projects():
    return [item for item in read_content(PROJECTS_PATH) if not item.get("hidden", False)]


@app.get("/content/blogs/{content_id}")
def get_blog(content_id: int):
    item = next((blog for blog in read_content(BLOGS_PATH) if blog.get("id") == content_id and not blog.get("hidden", False)), None)
    if not item:
        raise HTTPException(404, "Blog not found")
    asset = item.get("asset_path")
    body = item.get("body") or ((CONTENT_DIR / asset).read_text() if asset and (CONTENT_DIR / asset).exists() else item.get("content_description", ""))
    return {**item, "body": body}


@app.post("/auth/request-otp")
def request_otp(payload: OTPRequest):
    if settings.auth_provider != "local":
        raise HTTPException(404, "OTP is managed by Supabase.")
    return create_otp(payload)


@app.post("/auth/password")
def login_with_password(payload: PasswordLogin):
    if settings.auth_provider != "local":
        raise HTTPException(404, "Password login is managed by Supabase.")
    phone = normalise_phone(payload.phone)
    user = next((item for item in read_db()["users"] if item.get("phone") == phone), None)
    if not user or not password_matches(payload.password, user.get("password_hash")):
        raise HTTPException(401, "Invalid mobile number or password.")
    return {"token": issue_token(user), "user": {key: value for key, value in user.items() if key != "password_hash"}}


@app.post("/auth/admin/request-otp")
def request_admin_otp(payload: OTPRequest):
    if settings.auth_provider != "local":
        raise HTTPException(404, "OTP is managed by Supabase.")
    return create_otp(payload, admin_only=True)


@app.post("/auth/verify-otp")
def verify_otp(payload: Verify):
    if settings.auth_provider != "local":
        raise HTTPException(404, "OTP verification is managed by Supabase.")
    channel, identifier = identifier_for(payload)
    challenge = store.get_challenge(identifier)
    if not challenge or utc(challenge["expires_at"]) < now() or challenge["attempts"] >= settings.otp_max_attempts:
        raise HTTPException(400, "Invalid or expired code")
    if not compare_digest(challenge["code_hash"], otp_hash(identifier, payload.code)):
        store.fail_challenge(identifier)
        raise HTTPException(400, "Invalid or expired code")
    db = read_db()
    user = next((u for u in db["users"] if u.get(channel) == identifier), None)
    if not user:
        # The client should now ask for a name, then retry verification with it.
        if not payload.name or not payload.name.strip():
            raise HTTPException(428, "New account: provide a name to complete sign-up.")
        is_admin = channel == "phone" and identifier == settings.admin_phone
        user = {"id": max([u.get("id", 0) for u in db["users"]] or [0]) + 1, "name": payload.name.strip(), channel: identifier, "role": "admin" if is_admin else "member", "access": ["admin", "candidate", "recruiter"] if is_admin else [], "created_at": now().isoformat()}
        db["users"].append(user)
    elif payload.name and payload.name.strip():
        user["name"] = payload.name.strip()
    if channel == "phone" and identifier == settings.admin_phone:
        user["role"] = "admin"
        user["access"] = ["admin", "candidate", "recruiter"]
    store.clear_challenge(identifier)
    write_db(db)
    return {"token": issue_token(user), "user": {key: value for key, value in user.items() if key != "password_hash"}}


@app.get("/auth/me")
def auth_me(user: dict = Depends(current_user)):
    return {key: value for key, value in user.items() if key != "password_hash"}


@app.get("/member/candidates")
def candidate_area(user: dict = Depends(require_access("candidate"))):
    return {"area": "candidate", "user": {"id": user["id"], "name": user["name"]}}


@app.get("/member/recruiters")
def recruiter_area(user: dict = Depends(require_access("recruiter"))):
    return {"area": "recruiter", "user": {"id": user["id"], "name": user["name"]}}


@app.post("/submissions")
def create_submission(payload: Submission, user: dict | None = Depends(lambda credentials=Depends(bearer): current_user(credentials) if credentials else None)):
    if payload.type in {"demo", "candidate", "recruiter"} and not user:
        raise HTTPException(401, "Please log in before making this request.")
    db = read_db()
    row = {"id": max([item.get("id", 0) for item in db["submissions"]] or [0]) + 1, **payload.model_dump(), "user_id": user.get("id") if user else None, "status": "pending", "created_at": now().isoformat()}
    db["submissions"].append(row)
    write_db(db)
    return row


@app.get("/content/{content_id}/interactions")
def get_interactions(content_id: str):
    return read_db()["interactions"].get(content_id, {"likes": [], "comments": []})


@app.post("/content/{content_id}/interactions")
def interact(content_id: str, payload: Interaction, user: dict = Depends(current_user)):
    db = read_db()
    record = db["interactions"].setdefault(content_id, {"likes": [], "comments": []})
    identity = user.get("phone") or user.get("email")
    if payload.action == "like":
        liked = identity not in record["likes"]
        if liked:
            record["likes"].append(identity)
        else:
            record["likes"].remove(identity)
        write_db(db)
        return {"liked": liked, "count": len(record["likes"])}
    if not payload.message or not payload.message.strip():
        raise HTTPException(400, "A comment is required.")
    comment = {"id": len(record["comments"]) + 1, "author": user["name"], "message": payload.message.strip(), "created_at": now().isoformat()}
    record["comments"].append(comment)
    write_db(db)
    return {"comment": comment}


@app.get("/admin/overview")
def admin_overview(_: dict = Depends(admin)):
    db = read_db()
    comments = [{"content_id": cid, **comment} for cid, record in db["interactions"].items() for comment in record["comments"]]
    likes = [{"content_id": cid, "count": len(record["likes"]), "people": record["likes"]} for cid, record in db["interactions"].items() if record["likes"]]
    submissions = list(reversed(db["submissions"]))
    actionable = [item for item in submissions if item.get("status", "pending") in {"pending", "later"}]
    request_types = {kind: len([item for item in actionable if item.get("type") == kind]) for kind in ("contact", "feedback", "recommendation", "demo", "candidate", "recruiter")}
    return {
        "submissions": submissions,
        "comments": list(reversed(comments)),
        "likes": likes,
        "users": db["users"],
        "content": {"blogs": read_content(BLOGS_PATH), "projects": read_content(PROJECTS_PATH)},
        "counts": {"requests": len(submissions), "actionable": len(actionable), "comments": len(comments), "likes": sum(item["count"] for item in likes), "by_type": request_types},
    }


@app.get("/admin/interview-tracker")
def get_interview_tracker(
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    _: dict = Depends(admin),
):
    items = ensure_interview_tracker()
    if status and status != "all":
        items = [item for item in items if item.get("status") == status]
    if priority and priority != "all":
        items = [item for item in items if item.get("priority") == priority]
    if search:
        needle = search.strip().lower()
        items = [item for item in items if needle in " ".join(str(item.get(key, "")) for key in ("company", "target_role", "contacts", "notes", "rounds_information")).lower()]
    return {"items": items, "total": len(items)}


@app.post("/admin/interview-tracker")
def create_interview_company(payload: InterviewCompanyCreate, _: dict = Depends(admin)):
    with identity_sync_lock:
        items = ensure_interview_tracker()
        if any(item.get("company", "").casefold() == payload.company.strip().casefold() for item in items):
            raise HTTPException(409, "This company is already in the tracker.")
        timestamp = now().isoformat()
        item = {
            "id": max([entry.get("id", 0) for entry in items] or [0]) + 1,
            **payload.model_dump(),
            "company": payload.company.strip(),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        items.append(item)
        store.put_json("interview_tracker", items)
    return item


@app.patch("/admin/interview-tracker/{company_id}")
def update_interview_company(company_id: int, payload: InterviewCompanyUpdate, _: dict = Depends(admin)):
    with identity_sync_lock:
        items = ensure_interview_tracker()
        item = next((entry for entry in items if entry.get("id") == company_id), None)
        if not item:
            raise HTTPException(404, "Company not found")
        changes = payload.model_dump(exclude_unset=True)
        if "company" in changes:
            changes["company"] = changes["company"].strip()
            if any(entry.get("id") != company_id and entry.get("company", "").casefold() == changes["company"].casefold() for entry in items):
                raise HTTPException(409, "This company is already in the tracker.")
        item.update(changes)
        item["updated_at"] = now().isoformat()
        store.put_json("interview_tracker", items)
    return item


@app.delete("/admin/interview-tracker/{company_id}")
def delete_interview_company(company_id: int, _: dict = Depends(admin)):
    with identity_sync_lock:
        items = ensure_interview_tracker()
        item = next((entry for entry in items if entry.get("id") == company_id), None)
        if not item:
            raise HTTPException(404, "Company not found")
        items.remove(item)
        store.put_json("interview_tracker", items)
    return {"deleted": True, "id": company_id}


@app.get("/admin/requests")
def admin_requests(
    type: str | None = None,
    status: str = "actionable",
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    _: dict = Depends(admin),
):
    items = read_db()["submissions"]
    if type and type != "all":
        items = [item for item in items if item.get("type") == type]
    if status == "actionable":
        items = [item for item in items if item.get("status", "pending") in {"pending", "later"}]
    elif status != "all":
        items = [item for item in items if item.get("status", "pending") == status]
    if from_date:
        items = [item for item in items if datetime.fromisoformat(item["created_at"].replace("Z", "+00:00")) >= from_date]
    if to_date:
        items = [item for item in items if datetime.fromisoformat(item["created_at"].replace("Z", "+00:00")) <= to_date]
    return {"items": list(reversed(items)), "total": len(items)}


@app.patch("/admin/submissions/{submission_id}/status")
def update_submission_status(submission_id: int, payload: SubmissionStatusUpdate, _: dict = Depends(admin)):
    with identity_sync_lock:
        db = read_db()
        item = next((entry for entry in db["submissions"] if entry.get("id") == submission_id), None)
        if not item:
            raise HTTPException(404, "Request not found")
        item["status"] = payload.status
        item["reviewed_at"] = now().isoformat()
        write_db(db)
    return item


@app.patch("/admin/users/{user_id}/access")
def update_user_access(user_id: int, payload: UserAccessUpdate, _: dict = Depends(admin)):
    db = read_db()
    user = next((item for item in db["users"] if item.get("id") == user_id), None)
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("phone") == settings.admin_phone and "admin" not in payload.access:
        raise HTTPException(400, "The primary admin access cannot be removed.")
    user["access"] = list(dict.fromkeys(payload.access))
    user["role"] = "admin" if "admin" in user["access"] else "member"
    write_db(db)
    return {key: value for key, value in user.items() if key != "password_hash"}


@app.post("/admin/content")
def create_content(payload: ContentCreate, _: dict = Depends(admin)):
    if payload.kind == "blog":
        blogs = read_content(BLOGS_PATH)
        content_id = max([item.get("id", 0) for item in blogs], default=0) + 1
        slug = "-".join("".join(ch.lower() if ch.isalnum() else " " for ch in payload.title).split())
        asset_path = f"articles/{slug}.md"
        ARTICLES_DIR.mkdir(parents=True, exist_ok=True)
        item = {"id": content_id, "title": payload.title, "content_description": payload.description, "date": now().date().isoformat(), "tags": payload.tags or [payload.category], "author": "Sanjay Gandhi", "fileType": "md", "isTextFile": True, "asset_path": asset_path, "body": payload.body or payload.description, "visibility": payload.visibility, "hidden": False}
        blogs.insert(0, item)
        write_content(BLOGS_PATH, blogs)
        return item
    projects = read_content(PROJECTS_PATH)
    content_id = max([item.get("id", 0) for item in projects], default=0) + 1
    item = {"id": content_id, "name": payload.title, "description": payload.description, "image": None, "github": None, "technologies": payload.technologies, "category": payload.category, "type": "app", "deployed": False, "priority": content_id, "projectId": content_id, "is_app": True, "features": [line.strip() for line in (payload.body or "").split("\n") if line.strip()], "visibility": payload.visibility, "hidden": False}
    projects.insert(0, item)
    write_content(PROJECTS_PATH, projects)
    return item


def content_store(kind: Literal["blog", "project"]):
    return (BLOGS_PATH, read_content(BLOGS_PATH)) if kind == "blog" else (PROJECTS_PATH, read_content(PROJECTS_PATH))


@app.patch("/admin/content/{kind}/{content_id}")
def update_content(kind: Literal["blog", "project"], content_id: int, payload: ContentUpdate, _: dict = Depends(admin)):
    path, items = content_store(kind)
    item = next((entry for entry in items if entry.get("id") == content_id), None)
    if not item:
        raise HTTPException(404, "Content not found")
    changes = payload.model_dump(exclude_none=True)
    if "title" in changes:
        item["title" if kind == "blog" else "name"] = changes.pop("title")
    if "description" in changes:
        item["content_description" if kind == "blog" else "description"] = changes.pop("description")
    if "body" in changes:
        if kind == "blog":
            item["body"] = changes.pop("body")
        else:
            item["features"] = [line.strip() for line in changes.pop("body").split("\n") if line.strip()]
    item.update(changes)
    item["updated_at"] = now().isoformat()
    write_content(path, items)
    return item


@app.delete("/admin/content/{kind}/{content_id}")
def delete_content(kind: Literal["blog", "project"], content_id: int, _: dict = Depends(admin)):
    path, items = content_store(kind)
    remaining = [entry for entry in items if entry.get("id") != content_id]
    if len(remaining) == len(items):
        raise HTTPException(404, "Content not found")
    write_content(path, remaining)
    return {"deleted": True, "id": content_id, "kind": kind}
